import nodemailer from 'nodemailer';

export const sendMail = async (
    email: string,
    subject: string,
    message: string,
    html: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message,
            html: html
        };

        const mailRes = await transporter.sendMail(mailOptions);
        console.log('Email sent:', mailRes.messageId);

        if (mailRes.accepted.length > 0) {
            return 'Email sent successfully';
        } else if (mailRes.rejected.length > 0) {
            return 'Email not sent';
        } else {
            return 'Email server error';
        }
    } catch (error: any) {
        console.error('Email sending failed:', error);
        return JSON.stringify(error.message, null, 500);
    }
};

// Helper function to generate verification email content
export const generateVerificationEmail = (verificationCode: string) => {
    const message = `Your verification code is: ${verificationCode}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p>Thank you for registering! Please use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
                <h1 style="color: #007bff; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
            <p>This code will expire in 1 hour.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
    `;

    return { message, html };
};