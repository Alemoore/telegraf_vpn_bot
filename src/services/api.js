import { v4 as uuidv4 } from 'uuid';
import { UserKey } from '../models/UserKey.js';

const adminUrl = process.env.ADMIN_API_URL || 'https://147.45.60.54.sslip.io/NwzLKcJBStlkuHSfXlmSjDsn9N/api/v2/admin/user/';
const userBaseUrl = process.env.USER_BASE_URL || 'https://147.45.60.54.sslip.io/gAkAqxEOGiZEWJ4o4heBV30Hvo51D/';

const calculateExpiryDate = (months = 1) => {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
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
        const url = `${userBaseUrl}${uuid}`;
        const expiresAt = calculateExpiryDate(months);

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
            const userKey = new UserKey({
                telegramId: user_telegram_id.toString(),
                uuid: data.uuid,
                url: url,
                expiresAt: expiresAt
            });
            await userKey.save();
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
        const keys = await UserKey.find({ 
            telegramId: telegramId.toString(),
            expiresAt: { $gt: new Date() } // Только активные ключи
        }).sort({ createdAt: -1 });
        
        return keys;
    } catch (error) {
        console.error('Error getting user keys:', error);
        throw error;
    }
}
