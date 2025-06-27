// backend/src/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { welcomeEmailTemplate } from '../utils/emailTemplates.js';
import { sendEmail } from '../utils/emailService.js';
import { welcomeEmailTemplate } from '../utils/emailTemplates.js';
// ===========================
// Register Controller
// ===========================
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { welcomeEmailTemplate } from '../utils/emailTemplates.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        // ✅ Send welcome email (non-blocking)
        sendEmail({
            to: email,
            subject: '🎉 Welcome to DCC!',
            html: generateEmailTemplate({
                title: `Welcome to DCC, ${username}!`,
                body: `We're excited to have you on board. You can now file, view, and vote on community cases.`
            })
        });

        res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error('Registration error ❌:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Login Controller
// ===========================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
