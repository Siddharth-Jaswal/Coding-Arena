const jwt = require('jsonwebtoken');
const config = require('../config');

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiresIn;

/**
 * Generates a JSON Web Token for a given user payload.
 * @param {Object} payload - The user data to sign (e.g., { userId, username, email }).
 * @returns {string} The signed JWT.
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JSON Web Token and returns the decoded payload.
 * @param {string} token - The JWT to verify.
 * @returns {Object} The decoded payload.
 * @throws {Error} If the token is invalid or expired.
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};
