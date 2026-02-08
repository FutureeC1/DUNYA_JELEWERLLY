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
    token = (os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    chat_id = (os.getenv("TELEGRAM_CHAT_ID") or "").strip()

    if not token or not chat_id:
        print("TELEGRAM_CONFIG_MISSING: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is empty")
        order.status = Order.STATUS_FAILED
        order.save(update_fields=["status"])
        return

    base_url = f"https://api.telegram.org/bot{token}"
    message = _build_message(order)

    try:
        resp = requests.post(
            f"{base_url}/sendMessage",
            data={"chat_id": chat_id, "text": message, "parse_mode": "HTML"},
            timeout=15,
        )

        if not resp.ok:
            print("TELEGRAM_SENDMESSAGE_FAILED:", resp.status_code, resp.text)
            order.status = Order.STATUS_FAILED
            order.save(update_fields=["status"])
            return

        for item in order.items.all():
            photo_resp = requests.post(
                f"{base_url}/sendPhoto",
                data={"chat_id": chat_id, "photo": item.image_url_snapshot},
                timeout=15,
            )
            if not photo_resp.ok:
                print("TELEGRAM_SENDPHOTO_FAILED:", photo_resp.status_code, photo_resp.text)
                # fallback: send link
                fallback = requests.post(
                    f"{base_url}/sendMessage",
                    data={"chat_id": chat_id, "text": f"Фото: {item.image_url_snapshot}"},
                    timeout=15,
                )
                if not fallback.ok:
                    print("TELEGRAM_FALLBACK_FAILED:", fallback.status_code, fallback.text)

        order.status = Order.STATUS_SENT
        order.save(update_fields=["status"])

    except requests.RequestException as e:
        print("TELEGRAM_REQUEST_EXCEPTION:", repr(e))
        order.status = Order.STATUS_FAILED
        order.save(update_fields=["status"])
