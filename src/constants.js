import { Markup } from 'telegraf';

// Keyboards
export const keyboards = {
    mainMenu: Markup.keyboard([
        ['🛒 Подключиться'],
        ['🔑 Мои ключи'],
        ['❓ Помощь']
    ]).resize(),

    selectTariff: Markup.keyboard([
        ['💫 Тариф 1 месяц'],
        ['⭐️ Тариф 3 месяца'],
        ['🌟 Тариф 6 месяцев'],
        ['🏠 Главное меню'],
    ]).resize(),

    helpMenu: Markup.keyboard([
        ['📱 Как подключиться'],
        ['❌ Не работает VPN'],
        ['👨‍💻 Связаться с поддержкой'],
        ['🏠 Главное меню']
    ]).resize(),

    deviceSelection: Markup.keyboard([
        ['📱 Android', '📱 iOS', '💻 Windows'],
        ['💻 MacOS', '📺 AndroidTV', '📺 AppleTV'],
        ['⬅️ Назад', '🏠 Главное меню']
    ]).resize(),

    cancelPayment: Markup.keyboard([
        ['❌ Отменить оплату']
    ]).resize()
};

// Messages
export const messages = {
    welcome: () => `
🌟 Добро пожаловать в VPN Bot!

🔐 Здесь вы можете:
• 🛒 Подключиться к VPN
• 🔑 Управлять своими ключами
• ❓ Получить помощь

🚀 Выберите действие в меню ниже:`,

    noActiveKeys: '❌ У вас пока нет активных ключей. Нажмите "🛒 Подключиться" чтобы приобрести подписку.',

    activeKeys: (keys) => {
        const keysList = keys.map((key, index) => {
            const daysLeft = Math.ceil((new Date(key.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
            return `🔑 Ключ ${index + 1}:
• Срок действия: до ${new Date(key.expiresAt).toLocaleDateString()}
• Осталось дней: ${daysLeft}
• Ссылка: ${key.url}
`;
        }).join('\n');
        return `🗝 Ваши активные ключи:\n\n${keysList}`;
    },

    vpnNotWorking: (userName = 'дорогой пользователь') => `
${userName}, я всегда рады помочь тебе!
Если не получается подключиться:

1️⃣ Проверьте подключение к интернету
2️⃣ Убедитесь, что вы скопировали всю ссылку целиком
3️⃣ Попробуйте переустановить приложение
4️⃣ Перезагрузите устройство

⚠️ Поддержка временно недоступна
Мы работаем над подключением службы поддержки.
Она будет доступна в ближайшее время.`,

    contactSupport: `
📞 Служба поддержки

⚠️ Поддержка временно недоступна
Мы работаем над подключением службы поддержки.
Она будет доступна в ближайшее время.

⚡️ Среднее время ответа: 15 минут`,

    deviceInstructions: {
        android: `
📱 Инструкция для Android:

1️⃣ Установите приложение V2rayNG из Google Play
2️⃣ Откройте приложение
3️⃣ Нажмите на + в правом верхнем углу
4️⃣ Выберите "Import config from clipboard"
5️⃣ Вставьте скопированную ссылку
6️⃣ Нажмите на галочку ✓ для сохранения
7️⃣ Включите VPN нажатием на кнопку ▶️`,

        ios: `
📱 Инструкция для iOS:

1️⃣ Установите приложение Streisand из App Store
2️⃣ Откройте приложение
3️⃣ Нажмите на + в правом верхнем углу
4️⃣ Выберите "Import from clipboard"
5️⃣ Вставьте скопированную ссылку
6️⃣ Нажмите "Start" для подключения`,

        windows: `
💻 Инструкция для Windows:

1️⃣ Скачайте v2rayN с GitHub
2️⃣ Распакуйте архив
3️⃣ Запустите v2rayN.exe
4️⃣ В трее нажмите правой кнопкой на значок v2rayN
5️⃣ Выберите "Import from clipboard"
6️⃣ Вставьте скопированную ссылку
7️⃣ Нажмите "Confirm"`,

        macos: `
💻 Инструкция для MacOS:

1️⃣ Установите V2rayU из App Store
2️⃣ Откройте приложение
3️⃣ Нажмите на значок в строке меню
4️⃣ Выберите "Import from clipboard"
5️⃣ Вставьте скопированную ссылку
6️⃣ Нажмите "Connect"`,

        androidtv: `
📺 Инструкция для Android TV:

1️⃣ На телефоне: нажми на ключ доступа и сгенерируй QR-код на сайте code-qr.ru
2️⃣ На ТВ: установи приложение V2rayNG из Google Play Store
3️⃣ Открой приложение и нажми на + в правом верхнем углу
4️⃣ Выбери "Scan QR code"
5️⃣ Отсканируй QR-код с телефона
6️⃣ Нажми на галочку ✓ для сохранения
7️⃣ Включи VPN нажатием на кнопку ▶️`,

        appletv: `
📺 Инструкция для Apple TV:

1️⃣ Откройте настройки на Apple TV
2️⃣ Перейдите в раздел "Сеть"
3️⃣ Выберите "Настроить DNS"
4️⃣ Введите DNS сервер: xxx.xxx.xxx.xxx
5️⃣ Нажмите "Готово"
6️⃣ Перезагрузите Apple TV`
    },

    paymentSuccess: (result) => {
        const daysLeft = Math.ceil((new Date(result.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        return `
🎉 Ваш VPN подключен!

Ссылка для подключения:
${result.url}

Срок действия: до ${new Date(result.expiresAt).toLocaleDateString()}
(${daysLeft} дней)

Сохраните эту ссылку, она понадобится для настройки VPN.`;
    }
};

// Commands
export const commands = {
    start: 'start',
    help: 'help'
};

// Button texts
export const buttons = {
    connect: '🛒 Подключиться',
    myKeys: '🔑 Мои ключи',
    help: '❓ Помощь',
    mainMenu: '🏠 Главное меню',
    back: '⬅️ Назад',
    cancelPayment: '❌ Отменить оплату',
    howToConnect: '📱 Как подключиться',
    vpnNotWorking: '❌ Не работает VPN',
    contactSupport: '👨‍💻 Связаться с поддержкой',
    tariffs: {
        month1: '💫 Тариф 1 месяц',
        month3: '⭐️ Тариф 3 месяца',
        month6: '🌟 Тариф 6 месяцев'
    },
    devices: {
        android: '📱 Android',
        ios: '📱 iOS',
        windows: '💻 Windows',
        macos: '💻 MacOS',
        androidtv: '📺 AndroidTV',
        appletv: '📺 AppleTV'
    }
};
