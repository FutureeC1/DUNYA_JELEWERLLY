# Dunya Jewellery (Silver Rings)

Fullstack project with separate frontend and backend deployments.

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend health check: `GET http://localhost:8000/health` → `{ "status": "ok" }`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Add products in Admin

1. Open `http://localhost:8000/admin/`.
2. Log in with your superuser credentials.
3. Add **silver ring** products in the Product model (only silver items are allowed).

## Telegram chat id setup (required)

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

6. Test:

```bash
cd backend
python manage.py telegram_test
```
