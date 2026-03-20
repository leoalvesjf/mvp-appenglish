import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP not configured, skipping email send')
        return { success: true, messageId: 'mock-id' }
    }

    const info = await transporter.sendMail({
        from: `"Miss Ana" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    })

    return { success: true, messageId: info.messageId }
}

export async function sendConfirmationEmail(email: string, token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const confirmUrl = `${baseUrl}/auth/confirm?token=${token}`

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; background: #000; color: #fff; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: #111; border-radius: 12px; padding: 30px; border: 1px solid #333; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .title { font-size: 20px; margin-bottom: 15px; }
                .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 20px; color: #888; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">Miss Ana</div>
                <div class="title">Confirm your email address</div>
                <p>Thank you for signing up! Please click the button below to verify your email:</p>
                <a href="${confirmUrl}" class="button">Confirm Email</a>
                <p>Or copy this link: ${confirmUrl}</p>
                <p>This link expires in 24 hours.</p>
                <div class="footer">© 2026 Miss Ana. Learn English the smart way.</div>
            </div>
        </body>
        </html>
    `

    return sendEmail({
        to: email,
        subject: 'Confirm your Miss Ana account',
        html,
    })
}
