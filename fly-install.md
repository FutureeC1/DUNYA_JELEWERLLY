# Установка Fly.io на Windows

## 📥 Скачайте бинарник вручную:

1. **Зайдите на:** https://github.com/superfly/flyctl/releases
2. **Скачайте:** flyctl-windows-amd64.exe
3. **Сохраните в:** C:\Windows\System32\flyctl.exe
4. **Добавьте в PATH:** C:\Windows\System32

## 🚀 После установки:

```bash
# Откройте новую командную строку (CMD или PowerShell)
flyctl --version
```

## 📋 Альтернативный способ:

### **Использовать WSL (Windows Subsystem for Linux):**
```bash
# Включите WSL и установите Ubuntu
wsl --install -d Ubuntu

# Установите Fly CLI в Ubuntu
curl -L https://fly.io/install.sh | sh

# Используйте flyctl из WSL
flyctl launch --no-deploy
```

## 🎯 После установки:

1. `fly auth login`
2. `fly launch --no-deploy`
3. `fly deploy`

**Fly.io готов к использованию!**
