import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    return token;
};

export const verifyToken = (token) => {
    try {
        const secret = process.env.JWT_SECRET || 'dev_secret';
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
