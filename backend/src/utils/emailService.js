// backend/src/utils/emailService.js

import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend with your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} param0
 * @param {string} param0.to - Recipient email address
 * @param {string} param0.subject - Email subject
 * @param {string} param0.html - HTML content of the email
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: 'DCC Team 👨‍⚖️ <noreply@dcc.dev>', // Can be updated from Resend verified sender domain
      to,
      subject,
      html,
    });

    console.log('✅ Email sent via Resend:', data?.id || 'No ID returned');
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Email sending failed');
  }
};
