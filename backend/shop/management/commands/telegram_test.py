from django.core.management.base import BaseCommand

from shop.services.telegram_service import send_order_to_telegram
from shop.models import Order


class Command(BaseCommand):
    help = "Send a test Telegram message using current bot settings."

    def handle(self, *args, **options):
        order = Order(
            customer_name="Test",
            customer_phone="+998000000000",
            customer_address="Tashkent",
            customer_comment="",
            subtotal_uzs=0,
            locale=Order.LOCALE_RU,
            theme=Order.THEME_LIGHT,
        )
        order.save()
        send_order_to_telegram(order)
        self.stdout.write(self.style.SUCCESS(f"Telegram status: {order.status}"))
        order.delete()
