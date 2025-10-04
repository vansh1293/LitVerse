import User from '../models/user.model.mjs';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.mjs';

const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Email format is invalid' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ email, fullName, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created', user: { id: user._id, email: user.email, fullName: user.fullName } });
    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Email format is invalid' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });
        const token = generateToken({ id: user._id });
        res.status(200).json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
    } catch (error) {
        console.log("Error in login controller: ", error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = (req, res) => {
    // For token based auth, frontend should drop the token.
    try {
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.log("Error in logout controller: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const checkAuth = (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        res.status(200).json({ user: req.user });
    } catch (error) {
        console.log("Error in checkAuth controller: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};