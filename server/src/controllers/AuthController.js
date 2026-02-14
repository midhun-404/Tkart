const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../database/repositories/UserRepository');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await UserRepository.create({
            name,
            email,
            password_hash,
            role: 'user' // Default role
        });

        // Generate token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN ATTEMPT] Email: ${email}, Password length: ${password?.length}`);

        // Check user
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            console.log(`[LOGIN FAILED] User not found for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        console.log(`[LOGIN] User found: ${user.id} | ${user.role} | Hash: ${user.password_hash?.substring(0, 10)}...`);

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log(`[LOGIN] Password match result: ${isMatch}`);

        if (!isMatch) {
            console.log(`[LOGIN FAILED] Password mismatch`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error("[LOGIN ERROR]", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await UserRepository.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe };
