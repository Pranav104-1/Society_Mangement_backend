import nodemailer from 'nodemailer'

export const sendVerficatonemail = async ({ to, subject = 'Verify your email', text, html }) => {
  if (!to) throw new Error('Missing recipient email')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const mail = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })

  return mail
}