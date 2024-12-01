# VPN Key Telegram Bot

Telegram бот для продажи и управления VPN ключами с оплатой через Telegram Stars.

## Функционал

- Просмотр доступных VPN ключей
- Покупка ключей через Telegram Stars
- Управление ключами (для администраторов)
- Просмотр купленных ключей

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` и заполните его:
```
BOT_TOKEN=your_bot_token_here
MONGODB_URI=your_mongodb_uri_here
ADMIN_ID=your_telegram_id_here
```

## Запуск

Для разработки:
```bash
npm run dev
```

Для продакшена:
```bash
npm start
```

## Команды бота

- `/start` - Начать работу с ботом
- `/help` - Получить справку
- `/buy_key` - Купить VPN ключ
- `/show_keys` - Показать купленные ключи
- `/add_key` - Добавить новый ключ (только для администраторов)

## Технологии

- Node.js
- Telegraf.js
- MongoDB
- Telegram Stars API
