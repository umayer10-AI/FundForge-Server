import { config } from '../config';
import { logger } from '../utils/logger';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async (params: EmailParams) => {
  try {
    if (config.nodeEnv === 'development') {
      logger.info(`[EMAIL] To: ${params.to}, Subject: ${params.subject}`);
      logger.debug(`[EMAIL] HTML: ${params.html.substring(0, 200)}...`);
      return { success: true };
    }

    if (!config.sendgrid.apiKey || config.sendgrid.apiKey === 'placeholder_sendgrid_key') {
      logger.warn('SendGrid API key not configured. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(config.sendgrid.apiKey);

    await sgMail.send({
      to: params.to,
      from: config.adminEmail,
      subject: params.subject,
      html: params.html,
    });

    logger.info(`Email sent to ${params.to}: ${params.subject}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send email to ${params.to}:`, error);
    return { success: false, message: 'Failed to send email' };
  }
};

const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: #f6f9fc; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 20px 20px 0 0; }
  .header h1 { color: #fff; margin: 0; font-size: 24px; }
  .content { background: #fff; padding: 30px; border-radius: 0 0 20px 20px; }
  .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; text-decoration: none; border-radius: 14px; font-weight: 600; margin: 20px 0; }
  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>FundForge AI</h1></div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>FundForge AI - Forge Ideas. Fund Dreams. Empower Communities.</p>
      <p><a href="${config.frontendUrl}">${config.frontendUrl}</a></p>
    </div>
  </div>
</body>
</html>`;

export const emailService = {
  sendWelcome: async (to: string, name: string, role: string, credits: number) => {
    const content = `
      <p>Welcome to FundForge AI, <strong>${name}</strong>!</p>
      <p>You have registered as a <strong>${role}</strong>.</p>
      <p>You have received <strong>${credits} credits</strong> to get started.</p>
      <a href="${config.frontendUrl}/dashboard/${role}" class="button">Go to Dashboard</a>
    `;
    return sendEmail({ to, subject: 'Welcome to FundForge AI 🎉', html: baseTemplate(content, 'Welcome!') });
  },

  sendVerification: async (to: string, token: string) => {
    const url = `${config.frontendUrl}/verify-email?token=${token}`;
    const content = `
      <p>Please verify your email address to get started.</p>
      <a href="${url}" class="button">Verify Email</a>
    `;
    return sendEmail({ to, subject: 'Verify Your Email', html: baseTemplate(content, 'Email Verification') });
  },

  sendPasswordReset: async (to: string, token: string) => {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    const content = `
      <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
      <a href="${url}" class="button">Reset Password</a>
    `;
    return sendEmail({ to, subject: 'Reset Your Password', html: baseTemplate(content, 'Password Reset') });
  },

  sendCampaignApproved: async (to: string, campaignTitle: string) => {
    const content = `
      <p>Your campaign <strong>${campaignTitle}</strong> has been approved! 🎉</p>
      <p>Supporters can now view and contribute to your campaign.</p>
      <a href="${config.frontendUrl}/campaigns" class="button">View Campaign</a>
    `;
    return sendEmail({ to, subject: 'Your Campaign Has Been Approved 🎉', html: baseTemplate(content, 'Campaign Approved') });
  },

  sendCampaignRejected: async (to: string, campaignTitle: string, reason: string) => {
    const content = `
      <p>Your campaign <strong>${campaignTitle}</strong> has been reviewed.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please make the necessary changes and resubmit.</p>
      <a href="${config.frontendUrl}/dashboard/creator" class="button">Go to Dashboard</a>
    `;
    return sendEmail({ to, subject: 'Campaign Review Result', html: baseTemplate(content, 'Campaign Update') });
  },

  sendContributionApproved: async (to: string, campaignTitle: string, amount: number) => {
    const content = `
      <p>Your contribution of <strong>${amount} credits</strong> to <strong>${campaignTitle}</strong> has been approved!</p>
      <a href="${config.frontendUrl}/dashboard/supporter/contributions" class="button">View Contributions</a>
    `;
    return sendEmail({ to, subject: 'Contribution Approved ✅', html: baseTemplate(content, 'Contribution Approved') });
  },

  sendContributionRejected: async (to: string, campaignTitle: string, reason?: string) => {
    const content = `
      <p>Your contribution to <strong>${campaignTitle}</strong> has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Your credits have been refunded.</p>
    `;
    return sendEmail({ to, subject: 'Contribution Update', html: baseTemplate(content, 'Contribution Rejected') });
  },

  sendNewContribution: async (to: string, campaignTitle: string, amount: number, supporterName: string) => {
    const content = `
      <p><strong>${supporterName}</strong> has contributed <strong>${amount} credits</strong> to your campaign <strong>${campaignTitle}</strong>!</p>
      <a href="${config.frontendUrl}/dashboard/creator/contributions" class="button">View Contributions</a>
    `;
    return sendEmail({ to, subject: 'New Contribution Received 🎉', html: baseTemplate(content, 'New Contribution') });
  },

  sendWithdrawalApproved: async (to: string, amount: number, method: string) => {
    const content = `
      <p>Your withdrawal request for <strong>$${amount}</strong> via <strong>${method}</strong> has been approved!</p>
      <p>The funds will be sent to your account shortly.</p>
    `;
    return sendEmail({ to, subject: 'Withdrawal Approved ✅', html: baseTemplate(content, 'Withdrawal Approved') });
  },

  sendWithdrawalRejected: async (to: string, reason: string) => {
    const content = `
      <p>Your withdrawal request has been rejected.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please contact support if you have any questions.</p>
    `;
    return sendEmail({ to, subject: 'Withdrawal Update', html: baseTemplate(content, 'Withdrawal Rejected') });
  },

  sendCreditsPurchased: async (to: string, credits: number, price: number) => {
    const content = `
      <p>You have successfully purchased <strong>${credits} credits</strong> for <strong>$${price}</strong>.</p>
      <p>Transaction was completed successfully.</p>
    `;
    return sendEmail({ to, subject: 'Credits Purchased ✅', html: baseTemplate(content, 'Purchase Successful') });
  },

  sendReportReceived: async (to: string, campaignTitle: string, reason: string) => {
    const content = `
      <p>A new report has been submitted for campaign <strong>${campaignTitle}</strong>.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <a href="${config.frontendUrl}/dashboard/admin/reports" class="button">Review Report</a>
    `;
    return sendEmail({ to, subject: 'New Report Submitted', html: baseTemplate(content, 'Report Received') });
  },

  sendCampaignSuspended: async (to: string, campaignTitle: string, reason: string) => {
    const content = `
      <p>Your campaign <strong>${campaignTitle}</strong> has been suspended.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please contact support for more information.</p>
    `;
    return sendEmail({ to, subject: 'Campaign Suspended', html: baseTemplate(content, 'Campaign Suspended') });
  },
};
