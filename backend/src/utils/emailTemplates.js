// backend/src/utils/emailTemplates.js

export const generateEmailTemplate = ({ title, body }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f6f6f6;
            padding: 20px;
          }
          .container {
            background-color: #fff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h2 {
            color: #2c3e50;
          }
          p {
            color: #34495e;
            line-height: 1.5;
          }
          .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${title}</h2>
          <p>${body}</p>
          <div class="footer">
            Regards,<br/>
            DCC Team 👨‍⚖️
          </div>
        </div>
      </body>
    </html>
  `;
};

export const caseStatusTemplate = (username, caseTitle) => `
  <h2>Dear ${username},</h2>
  <p>Your case titled <strong>"${caseTitle}"</strong> has been <b>published for voting</b>.</p>
  <p>Citizens can now vote on this case. You will be notified once a verdict is reached.</p>
  <br/>
  <p>Regards,</p>
  <p><strong>DCC Team</strong></p>
`;

// ✅ Forgot Password Template
export const forgotPasswordTemplate = (resetLink) => `
  <h2>Reset Your Password</h2>
  <p>We received a request to reset your DCC account password.</p>
  <p>Click the link below to reset it:</p>
  <a href="${resetLink}" style="display:inline-block; padding:10px 15px; background:#2c3e50; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
  <p>If you didn't request this, you can safely ignore this email.</p>
`;

export const welcomeEmailTemplate = (username) => `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
    <div style="background-color: #fff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50;">Welcome to <span style="font-weight:bold; text-shadow: 1px 1px 2px #aaa;">Decentralized Community Court (DCC)</span> ⚖️</h2>
      <p style="color: #34495e;">Hi ${username},</p>
      <p style="color: #34495e;">Your account is ready to go! 🚀</p>
      <p style="color: #34495e;">Start filing your cases or casting your votes today.</p>
      <br/>
      <p style="font-size: 0.9em; color: #888;">Regards,<br/>DCC Team 👨‍⚖️</p>
    </div>
  </div>
`;

export const caseSubmissionTemplate = (username, caseTitle) => `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
    <div style="background-color: #fff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50;">📬 Case Submitted</h2>
      <p style="color: #34495e;">Hi ${username},</p>
      <p style="color: #34495e;">Your case titled <strong>${caseTitle}</strong> has been submitted successfully.</p>
      <p style="color: #34495e;">Our team will review it and notify you once it's published.</p>
      <br/>
      <p style="font-size: 0.9em; color: #888;">Regards,<br/>DCC Team 👨‍⚖️</p>
    </div>
  </div>
`;

// ✅ NEW: Target Notification Template
export const targetNotificationTemplate = (username, caseTitle, caseDescription) => `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
    <div style="background-color: #fff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #e74c3c;">⚖️ Case Filed Against You</h2>
      <p style="color: #34495e;">Dear ${username},</p>
      <p style="color: #34495e;">A case has been filed against you in the Decentralized Community Court.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Case Details:</h3>
        <p style="color: #34495e; margin-bottom: 10px;"><strong>Title:</strong> ${caseTitle}</p>
        <p style="color: #34495e; margin-bottom: 0;"><strong>Description:</strong> ${caseDescription}</p>
      </div>
      
      <p style="color: #34495e;">You are required to respond to this case within 7 days. Please log in to your DCC account to:</p>
      <ul style="color: #34495e;">
        <li>View the complete case details</li>
        <li>Submit your response</li>
        <li>Provide any relevant evidence</li>
      </ul>
      
      <p style="color: #34495e;"><strong>Important:</strong> Failure to respond may result in a default judgment.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/cases" style="display:inline-block; padding:12px 24px; background:#e74c3c; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">View Case & Respond</a>
      </div>
      
      <p style="color: #7f8c8d; font-size: 0.9em;">If you believe this case was filed in error, please contact our support team immediately.</p>
      
      <br/>
      <p style="font-size: 0.9em; color: #888;">Regards,<br/>DCC Team 👨‍⚖️</p>
    </div>
  </div>
`;

// ✅ NEW: Verification Request Template
export const verificationRequestTemplate = (username, caseTitle, caseId) => `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
    <div style="background-color: #fff; border-radius: 10px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #f39c12;">🔍 Manual Verification Required</h2>
      <p style="color: #34495e;">Dear ${username},</p>
      <p style="color: #34495e;">A case requires manual verification as the automatic verification process was unable to identify the target.</p>
      
      <div style="background-color: #f8f9fa; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">Case Information:</h3>
        <p style="color: #34495e; margin-bottom: 10px;"><strong>Title:</strong> ${caseTitle}</p>
        <p style="color: #34495e; margin-bottom: 0;"><strong>Case ID:</strong> ${caseId}</p>
      </div>
      
      <p style="color: #34495e;">Please review the case and:</p>
      <ul style="color: #34495e;">
        <li>Verify the target's identity using available information</li>
        <li>Contact community watchmen/caretakers if needed</li>
        <li>Make a decision to approve or reject the verification</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/verifications" style="display:inline-block; padding:12px 24px; background:#f39c12; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">Review Case</a>
      </div>
      
      <p style="color: #7f8c8d; font-size: 0.9em;">This verification should be completed within 48 hours.</p>
      
      <br/>
      <p style="font-size: 0.9em; color: #888;">Regards,<br/>DCC Team 👨‍⚖️</p>
    </div>
  </div>
`;

// Password Reset Email Template
export const passwordResetTemplate = (context) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${context.name},</h2>
            <p>We received a request to reset your password for your DCC Court account.</p>
            <p>Click the button below to reset your password. This link will expire in ${context.expiryTime}.</p>
            
            <div style="text-align: center;">
                <a href="${context.resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${context.resetUrl}</p>
        </div>
        <div class="footer">
            <p>This is an automated message from DCC Court. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`

// Password Reset Success Email Template
export const passwordResetSuccessTemplate = (context) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
            <h2>Hello ${context.name},</h2>
            <p>Your password has been successfully reset.</p>
            <p>If you did not perform this action, please contact our support team immediately as your account may have been compromised.</p>
            <p>You can now log in to your DCC Court account with your new password.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from DCC Court. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`

// Judge Request Email Template
export const judgeRequestTemplate = (context) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Judge Role Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e6f3ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚖️ New Judge Role Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${context.adminName},</h2>
            <p>A new judge role request has been submitted and requires your review.</p>
            
            <div class="info-box">
                <h3>Request Details:</h3>
                <p><strong>Requester:</strong> ${context.requesterName}</p>
                <p><strong>Email:</strong> ${context.requesterEmail}</p>
                <p><strong>Reason:</strong> ${context.reason}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Please review this request and take appropriate action through the admin dashboard.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from DCC Court. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`

// Judge Request Response Email Template
export const judgeRequestResponseTemplate = (context) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Judge Request ${context.status === 'approved' ? 'Approved' : 'Rejected'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${context.status === 'approved' ? '#48bb78 0%, #38a169 100%' : '#f56565 0%, #e53e3e 100%'}); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-box { background: ${context.status === 'approved' ? '#d4edda' : '#f8d7da'}; border-left: 4px solid ${context.status === 'approved' ? '#48bb78' : '#f56565'}; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚖️ Judge Request ${context.status === 'approved' ? 'Approved' : 'Rejected'}</h1>
        </div>
        <div class="content">
            <h2>Hello ${context.name},</h2>
            
            <div class="status-box">
                <h3>Your judge role request has been <strong>${context.status}</strong>.</h3>
                ${context.status === 'approved' ? '<p>Congratulations! You are now a judge and can preside over cases.</p>' : '<p>We appreciate your interest in becoming a judge.</p>'}
                ${context.adminComment ? `<p><strong>Admin Comment:</strong> ${context.adminComment}</p>` : ''}
            </div>
            
            ${context.status === 'approved' ? 
                '<p>You now have access to judge-specific features including presiding over cases and making final decisions.</p>' : 
                '<p>You may submit a new request after 30 days if you believe your qualifications have changed.</p>'
            }
        </div>
        <div class="footer">
            <p>This is an automated message from DCC Court. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`
