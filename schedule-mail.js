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
    let mailHTML = `<html>
      <body style="font-family: 'Arial', sans-serif;">
        <div style="text-align: center;">
          <img src="./views/assets/images/botlogo.png" alt="" width="250" height="250" style="display: block; margin: 0 auto;">
          <h1 style="font-family: 'Pacifico', cursive; color: #007BFF; margin: 0 auto;">Themisto Sales Bot</h1>
        </div>`;

    if (meet === 'online') {
      mailHTML += `<p style="font-family: 'Helvetica', sans-serif;">Hello ${name},</p>
        <p style="font-family: 'Verdana', sans-serif;">I hope this message finds you in good health and high spirits.</p>
        <p>I am delighted to inform you that the sales meeting you requested has been successfully scheduled.</p>
        <p>Meeting Details:</p>
        <p style="font-weight: bold;">Date: ${date} 🗓️</p>
        <p></p>
        <p style="font-weight: bold;">Time: ${time} ⏰</p>
        <p></p>
        <p style="font-weight: bold;">Meeting Type: ${meet} 😊</p>
        <p></p>
        <p style="font-weight: bold;">Meeting Link: 'https://meet.google.com/brv-wnsa-sqm' 🔗</p>
        <p></p>
        
        <p style="font-family: 'Comic Sans MS', cursive;">Thank you, and have a fantastic day! 😎</p>
      </body>
    </html>`;
    } else if (meet === 'offline') {
      mailHTML += `<p style="font-family: 'Helvetica', sans-serif;">Hello ${name},</p>
        <p style="font-family: 'Verdana', sans-serif;">I hope this message finds you in good health and high spirits.</p>
        <p>I am delighted to inform you that the sales meeting you requested has been successfully scheduled.</p>
        <p>Meeting Details:</p>
        <p style="font-weight: bold;">Date: ${date} 🗓️</p>
        <p></p>
        <p style="font-weight: bold;">Time: ${time} ⏰</p>
        <p></p>
        <p style="font-weight: bold;">Meeting Type: ${meet} 😊</p>
        <p></p>
        <p style="font-weight: bold;">Meeting Address: ${address} 🏢</p>
        <p></p>
        
        <p style="font-family: 'Georgia', serif;">Thank you, and have a fantastic day! 😎</p>
      </body>
    </html>`;
    } else {
      reject(new Error('Invalid meet type'));
      return;
    }

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
