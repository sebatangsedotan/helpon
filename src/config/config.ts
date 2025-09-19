import dotenv from 'dotenv';

dotenv.config();

// --- JWT ---
export const CONFIG_ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const CONFIG_REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
export const CONFIG_ACCESS_TOKEN_EXPIRY = Number(process.env.ACCESS_TOKEN_EXPIRY);
export const CONFIG_REFRESH_TOKEN_EXPIRY = Number(process.env.REFRESH_TOKEN_EXPIRY);

// --- Server ---
export const CONFIG_HOST = process.env.HOST || 'localhost'; 
export const CONFIG_PORT = process.env.PORT || 3001;
export const CONFIG_NODE_ENV = process.env.NODE_ENV || 'development';

// --- Database ---
export const CONFIG_DATABASE_URL = process.env.DATABASE_URL;

// --- Google reCAPTCHA ---
export const CONFIG_RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
export const CONFIG_RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

