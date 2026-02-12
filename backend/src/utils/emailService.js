import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import {
  welcomeEmailTemplate,
  generateEmailTemplate,
  passwordResetTemplate,
  passwordResetSuccessTemplate,
  judgeRequestTemplate,
  judgeRequestResponseTemplate
} from './emailTemplates.js';
dotenv.config();

let transporter;
let resend;

// Initialize email service based on configuration
if (process.env.EMAIL_SERVICE === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else if (process.env.RESEND_API_KEY) {
  // Initialize Resend only if API key is provided
  resend = new Resend(process.env.RESEND_API_KEY);
}

const emailTemplates = {
  welcome: welcomeEmailTemplate,
  passwordReset: passwordResetTemplate,
  passwordResetSuccess: passwordResetSuccessTemplate,
  judgeRequest: judgeRequestTemplate,
  judgeRequestResponse: judgeRequestResponseTemplate,
  // ... existing templates ...
}

export const sendEmail = async ({ to, subject, html, template, context }) => {
  let resolvedHtml = html;

  if (!resolvedHtml && template) {
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      throw new Error(`Email template not found: ${template}`);
    }
    resolvedHtml = templateFn(context || {});
  }

  if (!resolvedHtml) {
    throw new Error('Email content is required (html or template/context)');
  }

  if (process.env.EMAIL_SERVICE === 'gmail' && transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"DCC Team 👨‍⚖️" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: resolvedHtml,
      });
      console.log('✅ Email sent via Gmail:', info.messageId);
    } catch (error) {
      console.error('❌ Gmail email sending failed:', error.message);
      throw new Error('Email sending failed');
    }
  } else if (resend) {
    try {
      const data = await resend.emails.send({
        from: 'DCC Team 👨‍⚖️ <onboarding@resend.dev>', // verified sender for Resend
        to,
        subject,
        html: resolvedHtml,
      });
      console.log('✅ Email sent via Resend:', data?.id || 'No ID returned');
    } catch (error) {
      console.error('❌ Resend email sending failed:', error.message);
      throw new Error('Email sending failed');
    }
  } else {
    console.log('⚠️ No email service configured, skipping email send');
  }
};
