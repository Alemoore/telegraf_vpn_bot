import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { createUser, getUserKeys } from './services/api.js';
import { keyboards, messages, commands, buttons } from './constants.js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

console.log('Initializing bot...');
console.log('Bot token:', process.env.BOT_TOKEN ? '✓ Token set' : '✗ Token missing');
console.log('Provider token:', process.env.PROVIDER_TOKEN ? '✓ Token set' : '✗ Token missing');
console.log('Hiddify API key:', process.env.HIDDIFY_API_KEY ? '✓ Key set' : '✗ Key missing');

// Middleware
bot.use(session());

// Basic commands
bot.command(commands.start, async (ctx) => {
    console.log('Start command received from user:', ctx.from.id);
    await ctx.reply(
        messages.welcome(ctx.from.first_name),
        keyboards.mainMenu
    );
});

bot.command(commands.help, (ctx) => ctx.reply('Чем могу помочь?'));

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
        await ctx.reply(messages.paymentSuccess(result), keyboards.mainMenu);
    } catch (error) {
        console.error('Error processing payment:', error);
        await ctx.reply('Произошла ошибка при создании ключа. Пожалуйста, обратитесь в поддержку.');
    }
});

// Хранение инвойсов пользователей
const userInvoiceMessages = new Map();

// Button handlers
bot.hears(buttons.myKeys, async (ctx) => {
    console.log('User keys requested by:', ctx.from.id);
    try {
        const keys = await getUserKeys(ctx.from.id);
        if (!keys || keys.length === 0) {
            await ctx.reply(messages.noActiveKeys, keyboards.mainMenu);
            return;
        }
        await ctx.reply(messages.activeKeys(keys), keyboards.mainMenu);
    } catch (error) {
        console.error('Error getting user keys:', error);
        await ctx.reply('Произошла ошибка при получении ключей. Пожалуйста, попробуйте позже.');
    }
});

bot.hears(buttons.connect, async (ctx) => {
    await ctx.reply('Выберите тариф:', keyboards.selectTariff);
});

// Обработчики тарифов
bot.hears(buttons.tariffs.month1, async (ctx) => {
    console.log('1 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', keyboards.cancelPayment);

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

bot.hears(buttons.tariffs.month3, async (ctx) => {
    console.log('3 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', keyboards.cancelPayment);

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

bot.hears(buttons.tariffs.month6, async (ctx) => {
    console.log('6 month tariff selected by user:', ctx.from.id);
    await ctx.reply('Инвойс для оплаты:', keyboards.cancelPayment);

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

// Отмена оплаты
bot.hears(buttons.cancelPayment, async (ctx) => {
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

    await ctx.reply('🔄 Выберите другой тариф:', keyboards.selectTariff);
});

bot.hears(buttons.help, async (ctx) => {
    await ctx.reply('Выберите раздел:', keyboards.helpMenu);
});

bot.hears(buttons.mainMenu, async (ctx) => {
    await ctx.reply('Главное меню:', keyboards.mainMenu);
});

bot.hears(buttons.howToConnect, async (ctx) => {
    await ctx.reply('Выберите ваше устройство:', keyboards.deviceSelection);
});

bot.hears(buttons.vpnNotWorking, async (ctx) => {
    await ctx.reply(messages.vpnNotWorking(ctx.from.first_name), keyboards.helpMenu);
});

bot.hears(buttons.contactSupport, async (ctx) => {
    await ctx.reply(messages.contactSupport, keyboards.helpMenu);
});

// Device instructions
bot.hears(buttons.devices.android, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.android, keyboards.deviceSelection);
});

bot.hears(buttons.devices.ios, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.ios, keyboards.deviceSelection);
});

bot.hears(buttons.devices.windows, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.windows, keyboards.deviceSelection);
});

bot.hears(buttons.devices.macos, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.macos, keyboards.deviceSelection);
});

bot.hears(buttons.devices.androidtv, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.androidtv, keyboards.deviceSelection);
});

bot.hears(buttons.devices.appletv, async (ctx) => {
    await ctx.reply(messages.deviceInstructions.appletv, keyboards.deviceSelection);
});

// Back button
bot.hears(buttons.back, async (ctx) => {
    await ctx.reply('Выберите раздел:', keyboards.helpMenu);
});

// Error handling
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже или обратитесь в поддержку.');
});

// Start the bot
function startBot() {
    bot.launch()
        .then(() => console.log('✓ Bot started'))
        .catch(err => console.error('✗ Bot start error:', err));

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

startBot();
