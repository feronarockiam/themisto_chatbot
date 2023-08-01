const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'themisto.sales@gmail.com', // Your Gmail email address
    pass: 'lwljokcbaunzaxqv' // Your Gmail password or app password
  }
});

function sendEmail(name, email, date, time, meet, address) {
  return new Promise((resolve, reject) => {
    let mailHTML = `
      <html>
      <body style="font-family: 'serif';">
        <div style="display: flex; align-items: center;">
          <!-- Left-aligned Image -->
          <img src="https://res.cloudinary.com/dngzcanli/image/upload/v1690712702/themistoCK_um3io0.jpg" alt="" width="400" height="250" style="display: block; margin: 0;">
          <div style="padding-left: 20px;">
    `;

    if (meet === 'online') {
      mailHTML += `
        <p style="font-weight: bold;">Hello ${name},</p>
        <p>I hope this message finds you in good health and high spirits.</p>
        <p>I am delighted to inform you that the sales meeting you requested has been successfully scheduled.</p>
        <p>Meeting Details:</p>
        <p><b>Date:</b> ${date} 🗓️</p>
        <p></p>
        <p><b>Time:</b> ${time} ⏰</p>
        <p></p>
        <p><b>Meeting Type:</b> ${meet} 😊</p>
        <p></p>
        <p><b>Meeting Link:</b> 'https://meet.google.com/brv-wnsa-sqm' 🔗</p>
        <p></p>
        <p>Thank you, and have a fantastic day! 😎</p>
      `;
    } else if (meet === 'offline') {
      mailHTML += `
        <p style="font-weight: bold;">Hello ${name},</p>
        <p>I hope this message finds you in good health and high spirits.</p>
        <p>I am delighted to inform you that the sales meeting you requested has been successfully scheduled.</p>
        <p>Meeting Details:</p>
        <p><b>Date:</b> ${date} 🗓️</p>
        <p></p>
        <p><b>Time:</b> ${time} ⏰</p>
        <p></p>
        <p><b>Meeting Type:</b> ${meet} 😊</p>
        <p></p>
        <p><b>Meeting Address:</b> ${address} 🏢</p>
        <p></p>
        <p>Thank you, and have a fantastic day! 😎</p>
      `;
    } else {
      reject(new Error('Invalid meet type'));
      return;
    }

    mailHTML += `
          </div>
        </div>
      </body>
      </html>
    `;

    // Compose the email message
    const mailOptions = {
      from: 'themisto.sales@gmail.com', // Sender address (your Gmail email address)
      to: email, // Recipient address
      subject: 'Hello from TEAM THEMISTO',
      html: mailHTML,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        resolve();
      }
    });
  });
}



module.exports = { sendEmail };
