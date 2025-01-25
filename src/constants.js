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

1️⃣ Нажми на ключ доступа полученный от бота и скопируйте его
2️⃣ Установи приложение 🌐V2rayNG https://play.google.com/store/apps/details?id=com.v2ray.ang&hl=ru
3️⃣ Запусти программу V2rayNG и нажми ➕ в правом верхнем углу
4️⃣ Выбери «Импорт из буфера обмена»
5️⃣ Нажми круглую кнопку включения и наслаждайся высокой скоростью и стабильностью 😉`,

        ios: `
📱 Инструкция для iOS:

Инструкция для IOS:

1️⃣ Нажми на ключ доступа полученный от бота и скопируйте его
2️⃣ Установи приложение 🌐Streisand https://apps.apple.com/ru/app/streisand/id6450534064
3️⃣ Запусти программу Streisand и нажми ➕ в правом верхнем углу
4️⃣ Выбери «Добавить из буфера» (если программа спросит разрешение на вставку - разреши)
5️⃣ Нажми круглую кнопку включения и наслаждайся высокой скоростью и стабильностью 😉
`,

        windows: `
💻 Инструкция для Windows:

1️⃣ Нажми на ключ доступа полученный от бота и скопируйте его 
2️⃣ Скачай и установи приложение 🌐V2Box https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690:
3️⃣ Запусти программу V2Box и перейди на вкладку «Configs» (снизу)
4️⃣ Далее нажми ➕ в правом верхнем углу и выбери «Import v2ray uri from clipboard» (первый пункт в списке)
5️⃣ После перейди на вкладку «Home» (снизу) и нажмите большую кнопку (снизу) «Tap to Connect»
6️⃣ Наслаждайся высокой скоростью и стабильностью 😉`,

        macos: `
💻 Инструкция для MacOS:

1️⃣ Нажми на ключ доступа полученный от бота и скопируйте его
2️⃣ Скачай и установи приложение 🌐V2Box https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690:
3️⃣ Запусти программу V2Box и перейди на вкладку «Configs» (снизу)
4️⃣ Далее нажми ➕ в правом верхнем углу и выбери «Import v2ray uri from clipboard» (первый пункт в списке)
5️⃣ После перейди на вкладку «Home» (снизу) и нажмите большую кнопку (снизу) «Tap to Connect»
6️⃣ Наслаждайся высокой скоростью и стабильностью 😉`,

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
