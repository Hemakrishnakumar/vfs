import { config } from 'dotenv';
config();

export const PORT = process.env.PORT || 4000;

export const SESSION_EXPIRE_IN_SECONDS = process.env.SESSION_EXPIRE_IN_SECONDS || 3600;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;

export const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

export const GMAIL_USER_EMAIL = process.env.GMAIL_USER;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;





