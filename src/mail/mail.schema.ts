import { z } from "zod";

export const sendEmailSchema = z.object({
    to: z.string().email(),
    subject: z.string(),
    html: z.string(),
})

export type TSendEmailSchema = z.infer<typeof sendEmailSchema>