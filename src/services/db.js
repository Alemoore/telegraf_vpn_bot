import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Путь к файлу базы данных (в Docker будет использоваться /app/data)
const dbPath = process.env.NODE_ENV === 'production' ? '/app/data/db.json' : join(__dirname, '../../db.json');

// Конфигурация адаптера
const adapter = new JSONFile(dbPath);

// Создание базы данных с начальной структурой
const defaultData = { userKeys: [] };
const db = new Low(adapter, defaultData);

// Первоначальная загрузка данных
await db.read();

// Инициализация данных, если файл пустой
db.data ||= defaultData;

export default db;