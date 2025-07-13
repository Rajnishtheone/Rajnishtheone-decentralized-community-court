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
            name,
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
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters long' });
        }

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
        } else if (role === 'admin' && userCount > 0) {
            // Only allow admin role for the first user or if explicitly set by existing admin
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
            name,
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
                    title: `Welcome to DCC, ${name}!`,
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
                name: newUser.name,
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
        const { email, password, role } = req.body;

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

        // Check if user is trying to login with correct role
        if (role && user.role !== role) {
            return res.status(400).json({ 
                message: `Invalid role. Your account is registered as ${user.role}. Please login as ${user.role}.` 
            });
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
                name: user.name,
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

// ===========================
// Google OAuth Login Controller
// ===========================
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // Decode the JWT token from Google
        const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
        
        const { email, name, picture, sub: googleId } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Email is required from Google' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // For new Google users, always require profile completion
            // since we don't have the additional profile data from the request
            return res.status(200).json({
                requiresProfileCompletion: true,
                googleData: {
                    email,
                    name: name || email.split('@')[0],
                    picture,
                    googleId
                },
                message: 'Please complete your profile information'
            });
        } else {
            // Update existing user's Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.isGoogleUser = true;
                if (picture && !user.profilePic) {
                    user.profilePic = picture;
                }
                await user.save();
            }
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
                name: user.name,
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
        console.error('Google login error ❌:', error.message);
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

// ===========================
// Complete Google Profile
// ===========================
const completeGoogleProfile = async (req, res) => {
    try {
        const { googleData, profileData } = req.body;

        if (!googleData || !profileData) {
            return res.status(400).json({ message: 'Google data and profile data are required' });
        }

        const { email, name, picture, googleId } = googleData;
        const { phone, building, flat, dateOfBirth, gender } = profileData;

        // Validate required fields
        if (!phone || !building || !flat || !dateOfBirth || !gender) {
            return res.status(400).json({ message: 'All profile fields are required' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with complete data
        const userCount = await User.countDocuments();
        const assignedRole = userCount === 0 ? 'admin' : 'member';

        user = new User({
            name: name || email.split('@')[0],
            username: name || email.split('@')[0],
            email,
            phone,
            building,
            flat,
            dateOfBirth,
            gender,
            profilePic: picture || '',
            role: assignedRole,
            googleId: googleId,
            isGoogleUser: true
        });

        await user.save();

        // Send welcome email
        try {
            sendEmail({
                to: email,
                subject: '🎉 Welcome to DCC!',
                html: generateEmailTemplate({
                    title: `Welcome to DCC, ${user.name}!`,
                    body: `We're excited to have you on board. You can now file, view, and vote on community cases.`
                })
            });
        } catch (emailError) {
            console.error('⚠️ Welcome email failed:', emailError.message);
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
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
        console.error('Complete Google profile error ❌:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export {
    registerUser,
    loginUser,
    googleLogin,
    completeGoogleProfile,
    forgotPassword,
    resetPassword
};
