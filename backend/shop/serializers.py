from typing import Any

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
    productSlug = serializers.SlugField()
    qty = serializers.IntegerField(min_value=1)
    selectedSize = serializers.IntegerField()


class OrderMetaSerializer(serializers.Serializer):
    locale = serializers.ChoiceField(choices=["ru", "uz"])
    theme = serializers.ChoiceField(choices=["light", "dark"])


class OrderCreateSerializer(serializers.Serializer):
    customer = OrderCustomerSerializer()
    items = OrderItemInputSerializer(many=True)
    meta = OrderMetaSerializer()

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Items list cannot be empty.")
        return value

    def create(self, validated_data: dict[str, Any]) -> Order:
        customer = validated_data["customer"]
        items_data = validated_data["items"]
        meta = validated_data["meta"]

        print(f"DEBUG: Creating order with items: {items_data}")
        
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
                print(f"DEBUG: Looking for product with slug: {item['productSlug']}")
                product = Product.objects.filter(slug=item["productSlug"], in_stock=True).first()
                if not product:
                    print(f"DEBUG: Product not found. Available products: {list(Product.objects.values_list('slug', flat=True))}")
                    raise serializers.ValidationError(
                        {"items": f"Product '{item['productSlug']}' not found or out of stock."}
                    )

                sizes = product.sizes or []
                print(f"DEBUG: Product sizes: {sizes}, requested size: {item['selectedSize']}")
                if item["selectedSize"] not in sizes:
                    raise serializers.ValidationError(
                        {"items": f"Selected size {item['selectedSize']} is not available."}
                    )

                image_urls = product.image_urls or []
                if not image_urls:
                    raise serializers.ValidationError({"items": "Product image is required."})

                line_total = product.price_uzs * item["qty"]
                subtotal += line_total

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    title_snapshot=product.title,
                    description_snapshot=product.description,
                    price_snapshot_uzs=product.price_uzs,
                    image_url_snapshot=image_urls[0],
                    qty=item["qty"],
                    selected_size=item["selectedSize"],
                )

            order.subtotal_uzs = subtotal
            order.save(update_fields=["subtotal_uzs"])

        send_order_to_telegram(order)
        return order
