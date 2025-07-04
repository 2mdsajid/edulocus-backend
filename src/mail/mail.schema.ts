import { z } from "zod";

export const sendEmailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    bcc:z.array(z.string()).optional(),
    html: z.string(),
})

export type TSendEmailSchema = z.infer<typeof sendEmailSchema>