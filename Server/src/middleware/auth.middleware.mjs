import User from '../models/user.model.mjs';
import { verifyToken } from '../lib/utils.mjs';

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized: Token not provided' });
        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });
        req.user = user;
        next();
    } catch (error) {
        console.log('Error in protect middleware: ', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};