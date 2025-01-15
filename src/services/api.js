import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

const adminUrl = process.env.ADMIN_API_URL || 'https://147.45.60.54.sslip.io/NwzLKcJBStlkuHSfXlmSjDsn9N/api/v2/admin/user/';
const userBaseUrl = process.env.USER_BASE_URL || 'https://147.45.60.54.sslip.io/gAkAqxEOGiZEWJ4o4heBV30Hvo51D/';

const calculateExpiryDate = (months = 1) => {
    const expiryDate = new Date();
    // Добавляем точно 30 дней за каждый месяц
    expiryDate.setDate(expiryDate.getDate() + (months * 30));
    return expiryDate;
};

export async function getUserInfo(token) {
    try {
        const getUserInfoOptions = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Hiddify-API-Key': token
            }
        };
        const response = await fetch(userBaseUrl + 'api/v2/user/me/', getUserInfoOptions);
        const data = await response.json();
        console.log('getUserInfo response:', data);
        return data;
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        throw error;
    }
}

export async function createUser(user_telegram_id, months = 1) {
    try {
        const uuid = uuidv4();
        const url = `${process.env.USER_BASE_URL}${uuid}`;
        const expiresAt = calculateExpiryDate(months);

        // Добавляем данные в LowDB
        db.data.userKeys.push({
            telegramId: user_telegram_id.toString(),
            uuid: uuid,
            url: url,
            expiresAt: expiresAt,
            createdAt: new Date(),
        });
        await db.write();

        console.log('User key saved to database');

        return {
            uuid: uuid,
            url: url,
            expiresAt: expiresAt
        };
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
    }
}

export async function getUserKeys(telegramId) {
    try {
        // Фильтрация активных ключей
        const keys = db.data.userKeys
            .filter(key => key.telegramId === telegramId.toString() && new Date(key.expiresAt) > new Date())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Сортировка по дате создания

        return keys;
    } catch (error) {
        console.error('Error getting user keys:', error);
        throw error;
    }
}