from django.contrib import admin

from .models import Order, OrderItem, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "price_uzs", "in_stock", "created_at")
    search_fields = ("title", "slug")
    list_filter = ("in_stock",)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "product",
        "title_snapshot",
        "description_snapshot",
        "price_snapshot_uzs",
        "image_url_snapshot",
        "qty",
        "selected_size",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "status", "created_at")
    readonly_fields = (
        "id",
        "customer_name",
        "customer_phone",
        "customer_address",
        "customer_comment",
        "subtotal_uzs",
        "locale",
        "theme",
        "status",
        "created_at",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "title_snapshot", "qty", "selected_size")
    readonly_fields = (
        "order",
        "product",
        "title_snapshot",
        "description_snapshot",
        "price_snapshot_uzs",
        "image_url_snapshot",
        "qty",
        "selected_size",
    )
