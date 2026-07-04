const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    

    await transporter.sendMail({
      from: `"Campus Placement Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

   
  } catch (error) {
    console.error("Email Error:", error);
  }
};

module.exports = sendEmail;