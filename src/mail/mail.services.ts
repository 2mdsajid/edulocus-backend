import * as nodemailer from "nodemailer";
import { TSendEmailSchema } from "./mail.schema";


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SECURE === 'true', // Use `true` for TLS, `false` for STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


export const sendEmail = async (sendMailData:TSendEmailSchema): Promise<nodemailer.SendMailOptions | null> => {
    try {
        const { to, subject, html } = sendMailData
        const mailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        if (!info) return null
        return info;
    } catch (error) {
        console.log("🚀 ~ sendEmail ~ error:", error)
        return null
    }
}