import os
from datetime import datetime

import requests
from django.utils import timezone

from ..models import Order


def _format_datetime(value: datetime) -> str:
    return timezone.localtime(value).strftime("%d.%m.%Y %H:%M")


def _build_message(order: Order) -> str:
    comment = order.customer_comment.strip() if order.customer_comment else "-"
    items_lines = []
    for idx, item in enumerate(order.items.all(), start=1):
        line_total = item.price_snapshot_uzs * item.qty
        items_lines.append(
            "\n".join(
                [
                    f"{idx}) {item.title_snapshot}",
                    f"   Размер: {item.selected_size} | Кол-во: {item.qty}",
                    f"   Цена: {item.price_snapshot_uzs} UZS | Сумма: {line_total} UZS",
                ]
            )
        )

    items_block = "\n".join(items_lines)
    short_id = str(order.id).split("-")[0]
    created_at = _format_datetime(order.created_at)

    if order.locale == Order.LOCALE_UZ:
        username_line = f"Buyurtmachi: @{order.customer_telegram_username}" if order.customer_telegram_username else ""
        return (
            "Dunya Jewellery\n"
            "Rasmiy veb-saytdan yangi buyurtma\n\n"
            f"Ism: {order.customer_name}\n"
            f"Telefon: {order.customer_phone}\n"
            f"Manzil: {order.customer_address}\n"
            f"Izoh: {comment}\n\n"
            "Taqinchoqlar:\n"
            f"{items_block}\n\n"
            f"To'lov summasi: {order.subtotal_uzs} UZS\n"
            f"Buyurtma: DJ-{short_id}\n"
            f"Sana: {created_at}\n\n"
            f"{username_line}"
        )

    username_line = f"Заказчик: @{order.customer_telegram_username}" if order.customer_telegram_username else ""
    return (
        "Dunya Jewellery\n"
        "Новый заказ с официального сайта\n\n"
        f"Имя: {order.customer_name}\n"
        f"Телефон: {order.customer_phone}\n"
        f"Адрес: {order.customer_address}\n"
        f"Комментарий: {comment}\n\n"
        "Товары:\n"
        f"{items_block}\n\n"
        f"Итого: {order.subtotal_uzs} UZS\n"
        f"Заказ: DJ-{short_id}\n"
        f"Дата: {created_at}\n\n"
        f"{username_line}"
    )


def send_order_to_telegram(order: Order) -> None:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", "").strip()

    if not token or not chat_id:
        order.status = Order.STATUS_FAILED
        order.save(update_fields=["status"])
        return

    base_url = f"https://api.telegram.org/bot{token}"
    message = _build_message(order)

    try:
        response = requests.post(
            f"{base_url}/sendMessage",
            data={"chat_id": chat_id, "text": message},
            timeout=10,
        )
        response.raise_for_status()

        for item in order.items.all():
            photo_response = requests.post(
                f"{base_url}/sendPhoto",
                data={"chat_id": chat_id, "photo": item.image_url_snapshot},
                timeout=10,
            )
            if not photo_response.ok:
                requests.post(
                    f"{base_url}/sendMessage",
                    data={
                        "chat_id": chat_id,
                        "text": f"Фото: {item.image_url_snapshot}",
                    },
                    timeout=10,
                )

        order.status = Order.STATUS_SENT
        order.save(update_fields=["status"])
    except requests.RequestException:
        order.status = Order.STATUS_FAILED
        order.save(update_fields=["status"])
