# Dunya Jewellery Backend

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Health Check

`GET /health` returns:

```json
{"status":"ok"}
```

## Telegram Chat ID setup

1. Create a bot via BotFather and get the token.
2. Send `/start` to your bot.
3. Open in browser:

```
https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
```

4. Find in the response:

```
"chat":{"id":123456789}
```

5. Add to `backend/.env`:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

6. Run:

```bash
python manage.py telegram_test
```

## Admin

Use Django Admin to add silver ring products at `http://localhost:8000/admin/`.

```bash
python manage.py createsuperuser
```
