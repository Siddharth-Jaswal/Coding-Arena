const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The hashed password.
 */
const hashPassword = async (password) => {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compares a plaintext password against a bcrypt hash.
 * @param {string} password - The plaintext password.
 * @param {string} hash - The bcrypt hash to compare against.
 * @returns {Promise<boolean>} True if the password matches the hash, false otherwise.
 */
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword
};
