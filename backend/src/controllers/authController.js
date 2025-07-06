// backend/src/controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { welcomeEmailTemplate } from '../utils/emailTemplates.js';
import { generateEmailTemplate } from '../utils/emailTemplates.js';

const registerUser = async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            phone, 
            building, 
            flat, 
            dateOfBirth, 
            gender, 
            role 
        } = req.body;

        // Validate required fields
        if (!username || username.trim().length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if this is the first user
        const userCount = await User.countDocuments();
        let assignedRole = role;
        if (userCount === 0) {
            assignedRole = 'admin';
        } else if (!role) {
            assignedRole = 'member';
        }

        // Handle profile picture upload
        let profilePic = '';
        if (req.file) {
            // Use the filename for storage, not the full path
            profilePic = req.file.filename;
        }

        // Create new user with all fields
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            phone,
            building,
            flat,
            dateOfBirth,
            gender,
            profilePic,
            role: assignedRole
        });

        await newUser.save();

        // ✅ Send welcome email (non-blocking)
        try {
            sendEmail({
                to: email,
                subject: '🎉 Welcome to DCC!',
                html: generateEmailTemplate({
                    title: `Welcome to DCC, ${username}!`,
                    body: `We're excited to have you on board. You can now file, view, and vote on community cases.`
                })
            });
        } catch (emailError) {
            console.error('⚠️ Welcome email failed:', emailError.message);
            // Don't fail registration if email fails
        }

        res.status(201).json({ 
            message: 'User registered successfully', 
            role: assignedRole,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                building: newUser.building,
                flat: newUser.flat,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender,
                age: newUser.age,
                profilePic: newUser.profilePic,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error ❌:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Login Controller
// ===========================
const loginUser = async (req, res) => {
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
                phone: user.phone,
                building: user.building,
                flat: user.flat,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                age: user.age,
                profilePic: user.profilePic,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email with reset link
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            template: 'passwordReset',
            context: {
                name: user.name,
                resetUrl,
                expiryTime: '1 hour'
            }
        });

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending password reset email' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Successful',
            template: 'passwordResetSuccess',
            context: {
                name: user.name
            }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
