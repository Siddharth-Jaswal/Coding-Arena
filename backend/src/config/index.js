const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, `../../${envFile}`);

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    isProduction,
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_only_please_change',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:5173']
};

module.exports = config;
