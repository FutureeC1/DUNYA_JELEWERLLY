import uuid
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price_uzs = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="UZS")

    # храните размеры как список в JSON:
    # [15, 15.5, 16, ...] или ["15", "15.5", ...] — serializer нормализует
    sizes = models.JSONField()

    in_stock = models.BooleanField(default=True)
    image_urls = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Order(models.Model):
    STATUS_NEW = "new"
    STATUS_SENT = "sent"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_SENT, "Sent"),
        (STATUS_FAILED, "Failed"),
    ]

    LOCALE_RU = "ru"
    LOCALE_UZ = "uz"
    LOCALE_CHOICES = [(LOCALE_RU, "RU"), (LOCALE_UZ, "UZ")]

    THEME_LIGHT = "light"
    THEME_DARK = "dark"
    THEME_CHOICES = [(THEME_LIGHT, "Light"), (THEME_DARK, "Dark")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=50)
    customer_address = models.CharField(max_length=255)
    customer_comment = models.TextField(blank=True)
    customer_telegram_username = models.CharField(max_length=255, blank=True)
    subtotal_uzs = models.PositiveIntegerField()
    locale = models.CharField(max_length=2, choices=LOCALE_CHOICES)
    theme = models.CharField(max_length=5, choices=THEME_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order {self.id}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    title_snapshot = models.CharField(max_length=255)
    description_snapshot = models.TextField()
    price_snapshot_uzs = models.PositiveIntegerField()
    image_url_snapshot = models.URLField()
    qty = models.PositiveIntegerField()

    # ✅ ВАЖНО: поддержка 15.5 / 16.5 / 19.5
    selected_size = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(Decimal("1.0"))],
    )

    def __str__(self) -> str:
        return f"{self.title_snapshot} x{self.qty}"
