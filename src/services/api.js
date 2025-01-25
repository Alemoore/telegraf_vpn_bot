import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const adminUrl = process.env.ADMIN_API_URL || 'https://147.45.60.54.sslip.io/NwzLKcJBStlkuHSfXlmSjDsn9N/api/v2/admin/user/';
const userBaseUrl = process.env.USER_BASE_URL || 'https://147.45.60.54.sslip.io/gAkAqxEOGiZEWJ4o4heBV30Hvo51D/';

const calculateExpiryDate = (months = 1) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (months * 30));
    return expiryDate;
};

export async function createUser(user_telegram_id, months = 1) {
    try {
        const uuid = uuidv4();
        const url = `${userBaseUrl}${uuid}`;
        const expiresAt = calculateExpiryDate(months);

        // Отправка запроса на сервер для создания пользователя
        const createUserOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Hiddify-API-Key': process.env.HIDDIFY_API_KEY || '609b0b30-64f3-4314-98b5-c394a993845d'
            },
            body: JSON.stringify({
                name: uuid,
                telegram_id: user_telegram_id,
                package_days: months * 30,
            })
        };

        console.log('Creating user with options:', createUserOptions);
        const response = await fetch(adminUrl, createUserOptions);
        const data = await response.json();
        console.log('createUser response:', data);

        if (data.uuid) {
            // Сохраняем ключ в базу данных
            db.data.userKeys.push({
                telegramId: user_telegram_id.toString(),
                uuid: data.uuid,
                url: url,
                expiresAt: expiresAt,
                createdAt: new Date(),
            });
            await db.write();

            console.log('User key saved to database');

            return {
                uuid: data.uuid,
                url: url,
                expiresAt: expiresAt
            };
        }

        throw new Error('UUID not received from API');
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
    }
}

export async function getUserKeys(telegramId) {
    try {
        // Фильтрация активных ключей
        // Сортировка по дате создания
        return db.data.userKeys
            .filter(key => key.telegramId === telegramId.toString() && new Date(key.expiresAt) > new Date())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error getting user keys:', error);
        throw error;
    }
}
