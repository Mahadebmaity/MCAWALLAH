import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_USER !== 'your_email@gmail.com') {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Fallback to ethereal test email transporter for local dev if real credentials aren't set
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('ℹ️ Nodemailer: Using Ethereal test mail server for dev.');
        } catch (e) {
            console.warn('⚠️ Nodemailer: Could not initialize test transporter:', e.message);
        }
    }

    return transporter;
};

export const sendContactNotification = async ({ name, email, subject, message }) => {
    try {
        const mailer = await getTransporter();
        if (!mailer) return false;

        const recipient = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'mahadeb@portfolio.com';

        const info = await mailer.sendMail({
            from: `"Portfolio Contact Form" <${process.env.SMTP_USER || 'no-reply@portfolio.com'}>`,
            to: recipient,
            replyTo: email,
            subject: `[Portfolio Contact] ${subject} - From ${name}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
                    <h2 style="color: #38bdf8; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 12px;">
                        📬 New Message on Your Portfolio!
                    </h2>
                    <p style="font-size: 15px; margin: 8px 0;"><strong>Sender Name:</strong> ${name}</p>
                    <p style="font-size: 15px; margin: 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #38bdf8;">${email}</a></p>
                    <p style="font-size: 15px; margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
                    <div style="margin-top: 16px; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 4px solid #38bdf8;">
                        <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0; color: #e2e8f0;">${message}</p>
                    </div>
                    <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
                        Sent automatically by your Portfolio CMS Admin Server.
                    </p>
                </div>
            `
        });

        console.log(`📧 Contact email sent successfully: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('⚠️ Failed to send contact notification email:', error.message);
        return false;
    }
};
