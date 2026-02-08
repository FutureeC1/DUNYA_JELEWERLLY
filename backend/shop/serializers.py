from typing import Any
from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem, Product
from .services.telegram_service import send_order_to_telegram


class ProductListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "price_uzs",
            "currency",
            "sizes",
            "in_stock",
            "image_urls",
            "created_at",
        )


class ProductDetailSerializer(ProductListSerializer):
    pass


class OrderCustomerSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=50)
    address = serializers.CharField(max_length=255)
    comment = serializers.CharField(allow_blank=True, required=False)
    telegram_username = serializers.CharField(allow_blank=True, required=False)


class OrderItemInputSerializer(serializers.Serializer):
    # Frontend must send EXACT keys:
    # { productSlug: "slug", qty: 1, selectedSize: 19.5 }
    productSlug = serializers.SlugField()
    qty = serializers.IntegerField(min_value=1)

    # ✅ accepts 15.5 / "15.5"
    selectedSize = serializers.DecimalField(max_digits=4, decimal_places=1)

    def validate_selectedSize(self, value: Decimal) -> Decimal:
        # normalize to 1 decimal place
        try:
            return Decimal(str(value)).quantize(Decimal("0.1"))
        except (InvalidOperation, ValueError, TypeError):
            raise serializers.ValidationError("Введите правильное число.")


class OrderMetaSerializer(serializers.Serializer):
    locale = serializers.ChoiceField(choices=["ru", "uz"])
    theme = serializers.ChoiceField(choices=["light", "dark"])


class OrderCreateSerializer(serializers.Serializer):
    customer = OrderCustomerSerializer()
    items = OrderItemInputSerializer(many=True)
    meta = OrderMetaSerializer()

    def to_representation(self, instance):
        if isinstance(instance, Order):
            return {
                "id": str(instance.id),
                "status": instance.status,
                "subtotal_uzs": instance.subtotal_uzs,
            }
        return super().to_representation(instance)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Items list cannot be empty.")
        return value

    @staticmethod
    def _to_decimal_1dp(v: Any) -> Decimal:
        # Converts numbers/strings to Decimal with 1 decimal place
        # Handles: 19, 19.0, 19.5, "19.5", "19,5"
        s = str(v).strip().replace(",", ".")
        return Decimal(s).quantize(Decimal("0.1"))

    @classmethod
    def _normalize_sizes_to_decimal(cls, sizes: list[Any]) -> list[Decimal]:
        out: list[Decimal] = []
        for s in (sizes or []):
            try:
                out.append(cls._to_decimal_1dp(s))
            except (InvalidOperation, ValueError, TypeError):
                continue
        return out

    def create(self, validated_data: dict[str, Any]) -> Order:
        customer = validated_data["customer"]
        items_data = validated_data["items"]
        meta = validated_data["meta"]

        with transaction.atomic():
            order = Order.objects.create(
                customer_name=customer["name"],
                customer_phone=customer["phone"],
                customer_address=customer["address"],
                customer_comment=customer.get("comment", ""),
                customer_telegram_username=customer.get("telegram_username", ""),
                subtotal_uzs=0,
                locale=meta["locale"],
                theme=meta["theme"],
                status=Order.STATUS_NEW,
            )

            subtotal = 0
            for item in items_data:
                product_slug = item["productSlug"]
                qty = int(item["qty"])

                # ✅ already validated and quantized by OrderItemInputSerializer
                requested_size: Decimal = item["selectedSize"]

                product = Product.objects.filter(slug=product_slug, in_stock=True).first()
                if not product:
                    raise serializers.ValidationError(
                        {"items": f"Product '{product_slug}' not found or out of stock."}
                    )

                sizes_raw = product.sizes or []
                sizes_dec = self._normalize_sizes_to_decimal(sizes_raw)

                if requested_size not in sizes_dec:
                    raise serializers.ValidationError(
                        {"items": f"Selected size {requested_size} is not available."}
                    )

                image_urls = product.image_urls or []
                if not image_urls:
                    raise serializers.ValidationError({"items": "Product image is required."})

                line_total = product.price_uzs * qty
                subtotal += line_total

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    title_snapshot=product.title,
                    description_snapshot=product.description,
                    price_snapshot_uzs=product.price_uzs,
                    image_url_snapshot=image_urls[0],
                    qty=qty,
                    selected_size=requested_size,  # ✅ Decimal (model must be DecimalField)
                )

            order.subtotal_uzs = subtotal
            order.save(update_fields=["subtotal_uzs"])

        # After successful transaction: send to Telegram
        send_order_to_telegram(order)
        return order
