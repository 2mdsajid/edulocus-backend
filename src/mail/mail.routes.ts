import express, { Request, Response } from 'express';
import { sendEmail } from './mail.services';
const router = express.Router();

router.post('/send-mail', async (request: Request, response: Response) => {
    try {
        const emailInfo = await sendEmail(request.body)
        return response.status(200).json({ data: emailInfo, message: 'Mail sent' });
    } catch (error) {
        console.log("🚀 ~ router.post ~ error:", error)
        return response.status(500).json({ data: null, message: 'Internal Server Error' })
    }
})

export default router