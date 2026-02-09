from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any

from django.db import transaction
from rest_framework import serializers

from .models import Order, OrderItem, Product
from .services.telegram_service import send_order_to_telegram


DECIMAL_SIZE_QUANT = Decimal("0.1")  # 15.5 -> 15.5 (1 знак после точки)


def _to_decimal_size(value: Any) -> Decimal:
    """
    Приводит размер к Decimal с 1 знаком после точки.
    Принимает: 15, 15.5, "15.5", "15,5"
    """
    if value is None:
        raise serializers.ValidationError("Размер обязателен.")

    s = str(value).strip().replace(",", ".")
    try:
        d = Decimal(s).quantize(DECIMAL_SIZE_QUANT)
    except (InvalidOperation, ValueError):
        raise serializers.ValidationError("Введите правильное число для размера.")
    if d <= 0:
        raise serializers.ValidationError("Размер должен быть больше 0.")
    return d


def _normalize_sizes_list(sizes: Any) -> list[Decimal]:
    """
    Product.sizes хранится в JSONField (может быть список чисел/строк).
    Нормализуем всё в Decimal(0.1).
    """
    if not isinstance(sizes, list):
        return []
    out: list[Decimal] = []
    for s in sizes:
        try:
            out.append(_to_decimal_size(s))
        except serializers.ValidationError:
            continue
    return out


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
    # Фронт должен отправлять ТОЧНО:
    # { productSlug: "slug", qty: 1, selectedSize: 15.5 }
    productSlug = serializers.SlugField()
    qty = serializers.IntegerField(min_value=1)

    # ВАЖНО: поддерживаем 15.5 (Decimal)
    selectedSize = serializers.DecimalField(max_digits=4, decimal_places=1)

    def validate_selectedSize(self, value: Decimal) -> Decimal:
        # Гарантируем 1 знак после точки и > 0
        return _to_decimal_size(value)


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
                selected_size: Decimal = _to_decimal_size(item["selectedSize"])

                product = Product.objects.filter(slug=product_slug, in_stock=True).first()
                if not product:
                    raise serializers.ValidationError(
                        {"items": f"Product '{product_slug}' not found or out of stock."}
                    )

                available_sizes = _normalize_sizes_list(product.sizes)
                if selected_size not in available_sizes:
                    raise serializers.ValidationError(
                        {"items": f"Selected size {selected_size} is not available."}
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
                    selected_size=selected_size,  # ⚠️ это требует изменения модели (см. ниже)
                )

            order.subtotal_uzs = subtotal
            order.save(update_fields=["subtotal_uzs"])

        # Отправка в Telegram после успешного коммита
        send_order_to_telegram(order)
        return order
