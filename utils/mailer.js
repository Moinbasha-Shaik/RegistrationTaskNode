const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, link) => {
  await transporter.sendMail({
    from: `"Moinbasha Shaik" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `<p>Click the link below to verify your email:</p><a href="${link}">${link}</a>`,
  });
};

module.exports = sendVerificationEmail;
