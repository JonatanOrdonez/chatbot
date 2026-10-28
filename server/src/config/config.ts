import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT || 3001);


export const DB_HOST = process.env.DB_HOST;
export const DB_PORT= Number(process.env.DB_PORT || 6543);
export const DB_NAME= process.env.DB_NAME;
export const DB_USER= process.env.DB_USER;
export const DB_PASSWORD= process.env.DB_PASSWORD;

export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Used only when the user prompt has an image: GROQ_MODEL is text-only
export const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b';

export const IMAGES_BUCKET = process.env.IMAGES_BUCKET || 'chat-images';
