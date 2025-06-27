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
