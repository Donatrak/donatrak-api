import { createTransport } from "nodemailer";

export const mailTransport = createTransport({
    host: 'mail.youth-arise.org',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});