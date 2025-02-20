import { TSendEmailSchema } from "./mail.schema"

export const sendSubscriptionRequestMailToUser = (email:string) => {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">Thank You for Your Interest!</h2>
  <p>We're thrilled that you've shown interest in our services. Our team will get in touch with you soon to discuss further details.</p>
  <p>In the meantime, feel free to explore our website to learn more about what we offer:</p>
  <p style="text-align: center; margin: 20px 0;">
    <a href="${process.env.FRONTEND}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Website</a>
  </p>
  <p style="font-size: 14px; color: #777; text-align: center;">
    <a href="${process.env.FRONTEND}/unsubscribe/${email}" style="color: #007bff; text-decoration: none;">Unsubscribe</a> | 
    <a href="${process.env.FRONTEND}/privacy-policy" style="color: #007bff; text-decoration: none;">Privacy Policy</a>
  </p>
</div>`
}

export const sendSubscriptionRequestMailToAdmin = (data: {name: string,email: string,phone: string}) => {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">New Subscription Request</h2>
  <p><strong>Name:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Phone:</strong> ${data.phone}</p>
</div>`
}


export const sendFeedbackMailToAdmin = (data: {name: string,email: string,message: string}) => {
    return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">New Feedback</h2>
  <p><strong>Name:</strong> ${data.name}</p>
  <p><strong>Email:</strong> ${data.email}</p>
  <p><strong>Message:</strong> ${data.message}</p>
</div>`
}


export const sendWelcomeMailToUser = (data: {name: string,email: string}) => {
    return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #007bff; text-align: center;">Welcome, ${data.name}!</h2>
  <p>We're glad to see you again. You've successfully logged in to your account using the email <strong>${data.email}</strong>.</p>
  <p>If this was you, no further action is required. If you didn't log in, please contact us immediately to secure your account.</p>
  <p style="text-align: center; margin: 20px 0;">
    <a href="${process.env.FRONTEND}" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Our Website</a>
  </p>
  <p style="font-size: 14px; color: #777; text-align: center;">
    <a href="${process.env.FRONTEND}/unsubscribe/${data.email}" style="color: #007bff; text-decoration: none;">Unsubscribe</a> | 
    <a href="${process.env.FRONTEND}/privacy-policy" style="color: #007bff; text-decoration: none;">Privacy Policy</a>
  </p>
</div>
    `
}

