import { Telegraf, session, Markup } from 'telegraf';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createUser, getUserKeys } from './services/api.js';

dotenv.config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✓ Connected to MongoDB'))
    .catch(err => console.error('✗ MongoDB connection error:', err));

const bot = new Telegraf(process.env.BOT_TOKEN);

console.log('Initializing bot...');
console.log('Bot token:', process.env.BOT_TOKEN ? '✓ Token set' : '✗ Token missing');
console.log('Provider token:', process.env.PROVIDER_TOKEN ? '✓ Token set' : '✗ Token missing');
console.log('Hiddify API key:', process.env.HIDDIFY_API_KEY ? '✓ Key set' : '✗ Key missing');

// Keyboards
const mainMenuKeyboard = Markup.keyboard([
    ['🛒 Подключиться'],
    ['🔑 Мои ключи'],
    ['❓ Помощь']
]).resize();

const selectTariffKeyboard = Markup.keyboard([
    ['💫 Тариф 1 месяц'],
    ['⭐️ Тариф 3 месяца'],
    ['🌟 Тариф 6 месяцев'],
    ['🏠 Главное меню'],
]).resize();

const helpMenuKeyboard = Markup.keyboard([
    ['📱 Как подключиться'],
    ['❌ Не работает VPN'],
    ['👨‍💻 Связаться с поддержкой'],
    ['🏠 Главное меню']
]).resize();

const deviceSelectionKeyboard = Markup.keyboard([
    ['📱 Android', '📱 iOS', '💻 Windows'],
    ['💻 MacOS', '📺 AndroidTV', '📺 AppleTV'],
    ['⬅️ Назад', '🏠 Главное меню']
]).resize();

const cancelPaymentKeyboard = Markup.keyboard([
    ['❌ Отменить оплату']
]).resize();

// Middleware
bot.use(session());

// Basic commands
bot.command('start', async (ctx) => {
    console.log('Start command received from user:', ctx.from.id);
    await ctx.reply(
        '🌟 Добро пожаловать в VPN Bot!\n\n' +
        '🔐 Здесь вы можете:\n' +
        '• 🛒 Подключиться к VPN\n' +
        '• 🔑 Управлять своими ключами\n' +
        '• ❓ Получить помощь\n\n' +
        '🚀 Выберите действие в меню ниже:',
        mainMenuKeyboard
    );
});

bot.command('help', (ctx) => ctx.reply('Чем могу помочь?'));

// Payment handling
bot.on("pre_checkout_query", async (ctx) => {
    const {id} = ctx.preCheckoutQuery;
    console.log('Pre-checkout query received:', id);
    try {
        await ctx.telegram.answerPreCheckoutQuery(id, true);
        console.log('Pre-checkout query approved');
    } catch (e) {
        console.error('Pre-checkout query error:', e);
    }
});

bot.on("successful_payment", async (ctx) => {
    console.log('Payment successful from user:', ctx.from.id);
    await ctx.reply("Оплата успешна!");
    const user_telegram_id = ctx.from.id;
    try {
        console.log('Creating user for telegram ID:', user_telegram_id);
        const result = await createUser(user_telegram_id, 1); // 1 месяц
        console.log('User created:', result);
        
        const daysLeft = Math.ceil((new Date(result.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
        await ctx.reply(
            `🎉 Ваш VPN подключен!\n\n` +
            `Ссылка для подключения:\n${result.url}\n\n` +
            `Срок действия: до ${new Date(result.expiresAt).toLocaleDateString()}\n` +
            `(${daysLeft} дней)\n\n` +
            `Сохраните эту ссылку, она понадобится для настройки VPN.`,
            mainMenuKeyboard
        );
    } catch (error) {
        console.error('Error processing payment:', error);
        await ctx.reply('Произошла ошибка при обработке платежа');
    }
});

// Menu handlers
bot.hears('🛒 Подключиться', (ctx) => {
    console.log('Connect request from user:', ctx.from.id);
    ctx.reply('Выберите тариф:', selectTariffKeyboard);
});

bot.hears('🔑 Мои ключи', async (ctx) => {
    console.log('User keys requested by:', ctx.from.id);
    try {
        const keys = await getUserKeys(ctx.from.id);
        
        if (keys.length === 0) {
            await ctx.reply('У вас пока нет активных ключей. Нажмите "🛒 Подключиться" чтобы приобрести VPN.');
            return;
        }

        const keysMessage = keys.map((key, index) => {
            const daysLeft = Math.ceil((new Date(key.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
            return `🔑 Ключ ${index + 1}:\n` +
                   `Создан: ${new Date(key.createdAt).toLocaleDateString()}\n` +
                   `Истекает: ${new Date(key.expiresAt).toLocaleDateString()}\n` +
                   `Осталось дней: ${daysLeft}\n` +
                   `Ссылка: ${key.url}\n`;
        }).join('\n');

        await ctx.reply('Ваши активные ключи:\n\n' + keysMessage);
    } catch (error) {
        console.error('Error getting user keys:', error);
        await ctx.reply('Произошла ошибка при получении ключей. Попробуйте позже.');
    }
});

bot.hears('❓ Помощь', async (ctx) => {
    await ctx.reply('Выберите раздел помощи:', helpMenuKeyboard);
});

const userInvoiceMessages = new Map();

bot.hears('💫 Тариф 1 месяц', async (ctx) => {
    console.log('1 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', cancelPaymentKeyboard);

    const invoiceMessage = await ctx.replyWithInvoice({
        currency: "XTR",
        prices: [{label: "VPN на месяц", amount: 1}],
        title: "Быстрый и надежный VPN",
        provider_token: process.env.PROVIDER_TOKEN || "",
        description: "Свободный доступ в интернет на месяц",
        payload: 'Тариф 1 месяц',
    });
    
    userInvoiceMessages.set(ctx.from.id, invoiceMessage.message_id);
});

bot.hears('⭐️ Тариф 3 месяца', async (ctx) => {
    console.log('3 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', cancelPaymentKeyboard);

    const invoiceMessage = await ctx.replyWithInvoice({
        currency: "XTR",
        prices: [{label: "VPN на 3 месяца", amount: 3}],
        title: "Быстрый и надежный VPN",
        provider_token: process.env.PROVIDER_TOKEN || "",
        description: "Свободный доступ в интернет на 3 месяца",
        payload: 'Тариф 3 месяца',
    });
    
    userInvoiceMessages.set(ctx.from.id, invoiceMessage.message_id);
});

bot.hears('🌟 Тариф 6 месяцев', async (ctx) => {
    console.log('6 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', cancelPaymentKeyboard);

    const invoiceMessage = await ctx.replyWithInvoice({
        currency: "XTR",
        prices: [{label: "VPN на 6 месяцев", amount: 6}],
        title: "Быстрый и надежный VPN",
        provider_token: process.env.PROVIDER_TOKEN || "",
        description: "Свободный доступ в интернет на 6 месяцев",
        payload: 'Тариф 6 месяцев',
    });
    
    userInvoiceMessages.set(ctx.from.id, invoiceMessage.message_id);
});

bot.hears('🏠 Главное меню', async ctx => {
    console.log('Main menu requested by user:', ctx.from.id);
    await ctx.reply('Возврат в главное меню', mainMenuKeyboard);
});

bot.hears('📱 Как подключиться', async (ctx) => {
    await ctx.reply(
        'Выберите ваше устройство для получения инструкции по подключению:',
        deviceSelectionKeyboard
    );
});

bot.hears('❌ Не работает VPN', async (ctx) => {
    const userName = ctx.from.first_name || 'дорогой пользователь';
    await ctx.reply(
        `${userName}, я всегда рады помочь тебе!\n` +
        'Если не получается подключиться:\n\n' +
        '1. Убедись, что у тебя есть действующий ключ. Для этого перейди в 🔑Мои ключи.\n\n' +
        '2. Если ключ есть — убедись, что он подключен. В 🔑Мои ключи выбери активный ключ, а затем выбери устройство и следуй инструкции. Если не получается настроить — не бойся писать в поддержку.\n\n' +
        '3. Если не прошла оплата — сначала проверь, не появился ли ключ в 🔑Мои ключи. Если деньги списались, а ключ не появился — напиши в поддержку.\n\n' +
        'Не помогло? Пиши @support_username.\n' +
        'С удовольствием поможем разобраться🐥',
        helpMenuKeyboard
    );
});

bot.hears('👨‍💻 Связаться с поддержкой', async (ctx) => {
    await ctx.reply(
        'Если у вас возникли проблемы, напишите в поддержку: @support_username\n' +
        'Время работы поддержки: 24/7',
        helpMenuKeyboard
    );
});

bot.hears('📱 Android', async (ctx) => {
    await ctx.reply(
        'Инструкция для Android:\n\n' +
        '1️⃣ Нажми на ключ доступа, чтобы скопировать его.\n' +
        '2️⃣ Установи приложение V2rayNG (https://play.google.com/store/apps/details?id=com.v2ray.ang&hl=ru).\n' +
        '3️⃣ Запусти программу V2rayNG и нажми ➕ в правом верхнем углу.\n' +
        '4️⃣ Выбери Импорт из буфера обмена.\n' +
        '5️⃣ Нажми круглую кнопку для подключения.',
        deviceSelectionKeyboard
    );
});

bot.hears('📱 iOS', async (ctx) => {
    await ctx.reply(
        'Инструкция для iOS:\n\n' +
        '1️⃣ Нажми на ключ доступа, чтобы скопировать его.\n\n' +
        '2️⃣ Установи приложение Streisand из App Store.\n\n' +
        '3️⃣ Запусти Streisand и нажми + в правом верхнем углу.\n\n' +
        '4️⃣ Выбери импорт из буфера обмена.\n\n' +
        '5️⃣ Нажми Start для подключения.',
        deviceSelectionKeyboard
    );
});

bot.hears('💻 Windows', async (ctx) => {
    await ctx.reply(
        'Инструкция для Windows:\n\n' +
        '1️⃣ Нажми на ключ доступа, чтобы скопировать его.\n\n' +
        '2️⃣ Скачай и распакуй Hiddify (https://github.com/hiddify/hiddify-next/releases/download/v2.3.1/Hiddify-Windows-Portable-x64.zip).\n\n' +
        '3️⃣ Запусти Hiddify.exe с правами администратора.\n\n' +
        '4️⃣ Нажми ➕ в правом верхнем углу и выбери Добавить из буфера обмена.\n\n' +
        '5️⃣ Перейди в Быстрые настройки в правом верхнем углу (слева от ➕) и выбери VPN (экспериментальный).\n\n' +
        '6️⃣ Нажми большую круглую кнопку для подключения.',
        deviceSelectionKeyboard
    );
});

bot.hears('💻 MacOS', async (ctx) => {
    await ctx.reply(
        'Инструкция для MacOS:\n\n' +
        '1️⃣ Нажми на ключ доступа, чтобы скопировать его.\n\n' +
        '2️⃣ Установи приложение V2Box из App Store.\n\n' +
        '3️⃣ Запусти V2Box и нажми + в правом верхнем углу.\n\n' +
        '4️⃣ Выбери импорт из буфера обмена.\n\n' +
        '5️⃣ Нажми кнопку подключения.',
        deviceSelectionKeyboard
    );
});

bot.hears('📺 AndroidTV', async (ctx) => {
    await ctx.reply(
        'Инструкция для Android TV:\n\n' +
        '1️⃣ На телефоне: нажми на ключ доступа и сгенерируй QR-код на сайте code-qr.ru\n\n' +
        '2️⃣ На ТВ: установи приложение V2rayNG из Google Play Store\n\n' +
        '3️⃣ Способы передачи конфигурации:\n' +
        '   • Сделай фото QR-кода и открой его в галерее на ТВ\n' +
        '   • Отправь фото QR-кода через Telegram на ТВ\n' +
        '   • Загрузи фото QR-кода на Google Фото и открой на ТВ\n\n' +
        '4️⃣ В приложении V2rayNG нажми ➕ и выбери "Сканировать QR код"\n\n' +
        '5️⃣ Наведи сканер на изображение с QR-кодом\n\n' +
        '6️⃣ После успешного сканирования нажми круглую кнопку для подключения',
        deviceSelectionKeyboard
    );
});

bot.hears('📺 AppleTV', async (ctx) => {
    await ctx.reply(
        'Инструкция для Apple TV\n' +
        '⚠️ Потребуется платное приложение Shadowrocket, разовая покупка 249 рублей!\n\n' +
        'На iPhone с тем же Apple ID, что и на телевизоре:\n' +
        '1️⃣ Нажми на ключ доступа, чтобы скопировать его.\n\n' +
        '2️⃣ Сгенерируй из него QR-код с помощью любого сервиса, например, code-qr.ru (https://code-qr.ru/), и сохрани в библиотеку iPhone.\n\n' +
        '3️⃣ Установи приложение Shadowrocket из App Store.\n\n' +
        '4️⃣ В приложении Shadowrocket нажми на сканирование (в левом верхнем углу) и выбери изображение с QR кодом.\n\n' +
        '5️⃣ Перейди на вкладку Данные (внизу), там выбери Apple TV, Серверы.\n\n' +
        'Далее на телевизоре:\n' +
        '6️⃣ Установи приложение Shadowrocket из App Store.\n\n' +
        '7️⃣ Выбери в правом верхнем углу кнопку с изображением сети и нажми соответствующий пункт на телефоне.',
        deviceSelectionKeyboard
    );
});

bot.hears('⬅️ Назад', async (ctx) => {
    await ctx.reply('Выберите раздел помощи:', helpMenuKeyboard);
});

bot.hears('❌ Отменить оплату', async (ctx) => {
    console.log('Payment cancelled by user:', ctx.from.id);
    
    const invoiceMessageId = userInvoiceMessages.get(ctx.from.id);
    if (invoiceMessageId) {
        try {
            await ctx.deleteMessage(invoiceMessageId);
        } catch (error) {
            console.error('Error deleting invoice message:', error);
        }
        userInvoiceMessages.delete(ctx.from.id);
    }

    await ctx.reply('🔄 Выберите другой тариф:', selectTariffKeyboard);
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Start the bot
const startBot = async () => {
    try {
        await bot.launch();
        console.log('✓ Bot successfully started!');
        console.log('✓ Bot username:', bot.botInfo?.username);
    } catch (error) {
        console.error('✗ Failed to start bot:', error);
    }
};

startBot();
