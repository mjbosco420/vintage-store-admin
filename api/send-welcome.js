import nodemailer from 'nodemailer'

const emailUser = (process.env.EMAIL_USER || '').trim()
const emailPass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '')

if (!emailUser || !emailPass) {
  throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD (or EMAIL_PASSWORD) must be configured on the server.')
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email } = req.body

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const mailOptions = {
      from: `"Vintage Store" <${emailUser}>`,
      to: email.trim(),
      subject: 'Welcome to Vintage Store!',
      html: `
        <h2>Welcome to our Vintage Store, ${name || 'Guest'}!</h2>
        <p>We are absolutely thrilled to have you here to shop with us.</p>
        <p>Explore our unique collection of vintage items and find your perfect style. If you ever need help or have questions, just reply to this email.</p>
        <br/>
        <p>Have a good day!</p>
      `
    }

    await transporter.verify()
    await transporter.sendMail(mailOptions)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return res.status(500).json({ message: 'Gagal mengirim email: ' + error.message })
  }
}