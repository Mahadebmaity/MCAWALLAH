import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim().toLowerCase() : '';
    const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (smtpUser && smtpPass && smtpUser !== 'your_email@gmail.com') {
        const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || smtpUser.includes('gmail');
        
        // Use connection pooling and direct SSL on port 465 (or configured port) for fast delivery
        const port = Number(process.env.SMTP_PORT) || (isGmail ? 465 : 587);
        const isSecure = port === 465;

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || (isGmail ? 'smtp.gmail.com' : 'smtp.gmail.com'),
            port,
            secure: isSecure,
            pool: true, // Keep connections pooled and open for ultra-fast dispatch
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 10,
            connectionTimeout: 8000, // 8s connection timeout
            greetingTimeout: 5000,
            socketTimeout: 12000,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else {
        // Fallback to ethereal test email transporter for local dev if real credentials aren't set
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                pool: true,
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

// Pre-warm and verify transporter connection on startup
getTransporter()
    .then(mailer => {
        if (mailer && typeof mailer.verify === 'function') {
            mailer.verify((err) => {
                if (err) {
                    console.warn('⚠️ SMTP Transporter warm-up notice:', err.message);
                } else {
                    console.log('✅ SMTP Mail Transporter connected & ready for fast email delivery.');
                }
            });
        }
    })
    .catch(() => {});

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

export const sendNewUserSignupAdminNotification = async ({ user, ip, userAgent }) => {
    try {
        const mailer = await getTransporter();
        if (!mailer) return false;

        const recipient = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || 'mahadeb@portfolio.com';
        const senderEmail = process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com'
            ? process.env.SMTP_USER
            : 'no-reply@mahadebmaity.dev';

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const formattedDate = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
        });

        const info = await mailer.sendMail({
            from: `"Portfolio Admin Alert" <${senderEmail}>`,
            to: recipient,
            subject: `🎉 [New User Registered] ${user.name} (${user.email})`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #0b0f19; color: #f1f5f9; padding: 28px 24px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="display: inline-block; padding: 6px 14px; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 9999px; color: #4ade80; font-size: 13px; font-weight: 600;">
                            ✨ NEW USER REGISTRATION
                        </span>
                    </div>

                    <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 16px; text-align: center;">
                        A New User Just Signed Up!
                    </h2>

                    <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8; width: 35%;"><strong>Name:</strong></td>
                                <td style="padding: 8px 0; color: #f8fafc; font-weight: 600;">${user.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Email:</strong></td>
                                <td style="padding: 8px 0; color: #38bdf8; font-weight: 600;">
                                    <a href="mailto:${user.email}" style="color: #38bdf8; text-decoration: none;">${user.email}</a> 
                                    <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); border-radius: 4px; padding: 2px 6px; margin-left: 6px; color: #38bdf8;">Verified OTP ✓</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Role:</strong></td>
                                <td style="padding: 8px 0; color: #f8fafc;">
                                    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; background: rgba(232, 69, 69, 0.2); color: #f87171; padding: 2px 8px; border-radius: 6px;">${user.role}</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Registration Time:</strong></td>
                                <td style="padding: 8px 0; color: #cbd5e1;">${formattedDate} (IST)</td>
                            </tr>
                            ${ip ? `
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>IP Address:</strong></td>
                                <td style="padding: 8px 0; color: #94a3b8; font-family: monospace;">${ip}</td>
                            </tr>` : ''}
                            ${userAgent ? `
                            <tr>
                                <td style="padding: 8px 0; color: #94a3b8;"><strong>Device / Browser:</strong></td>
                                <td style="padding: 8px 0; color: #94a3b8; font-size: 12px;">${userAgent.slice(0, 80)}...</td>
                            </tr>` : ''}
                        </table>
                    </div>

                    <div style="text-align: center; margin: 24px 0 16px;">
                        <a href="${clientUrl}/admin/users" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
                            Open Admin Studio &rarr;
                        </a>
                    </div>

                    <p style="font-size: 12px; color: #64748b; text-align: center; margin: 16px 0 0;">
                        Sent automatically by your Portfolio CMS Notification System.
                    </p>
                </div>
            `
        });

        console.log(`📧 New user signup admin alert sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('⚠️ Failed to send new user signup admin alert:', error.message);
        return false;
    }
};


