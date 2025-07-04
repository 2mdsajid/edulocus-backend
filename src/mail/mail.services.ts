import * as nodemailer from "nodemailer";
import { TSendEmailSchema } from "./mail.schema";
import prisma from "../utils/prisma";


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SECURE === 'true', // Use `true` for TLS, `false` for STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const getChapterWiseSubscribedEmails = async (): Promise<string[] | null> => {
    const subscriptions = await prisma.chapterwiseRegistration.findMany({
        select: {
            email: true
        }
    })
    if (!subscriptions) return null
    return subscriptions.map(c => c.email)
}


export const sendEmail = async (sendMailData: TSendEmailSchema): Promise<nodemailer.SendMailOptions | null> => {
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

export const sendChapterWiseTestSeriesMail = async (sendMailData: TSendEmailSchema): Promise<nodemailer.SendMailOptions | null> => {
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
