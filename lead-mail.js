const nodemailer = require('nodemailer');

// Create a transporter with your Gmail account credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'themisto.sales@gmail.com', // Your Gmail email address
    pass: 'lwljokcbaunzaxqv' // Your Gmail password or app password
  }
});

function leadEmail(recipient, message) {
  return new Promise((resolve, reject) => {
    // Compose the email message
    const mailOptions = {
      from: 'themisto.sales@gmail.com', // Sender address (your Gmail email address)
      to: recipient, // Recipient address
      subject: 'Exciting News! From Team Themisto',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            /* Define different font styles */
            .title {
              font-family: 'Arial', sans-serif;
              font-size: 24px;
              text-align: center;
              color: #007BFF; /* Blue color */
            }
            .content {
              font-family: 'Verdana', sans-serif;
              font-size: 16px;
              color: #4CAF50; /* Green color */
            }
            /* Add some padding to the email content for a professional look */
            .email-content {
              padding: 20px;
            }
            /* Container to hold the image and content in a row layout */
            .container {
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
            }
            /* Style for the image */
            .email-image {
              width: 200px;
              margin-right: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Left-aligned Image -->
            <img src="https://res.cloudinary.com/dngzcanli/image/upload/v1690712702/themistoCK_um3io0.jpg" alt="Left-aligned Image" class="email-image" width="300">
            <!-- Right-aligned Content -->
            <div class="email-content">
              <!-- Title with Emoji -->
              <div class="title">🚀 Exciting News! From Team Themisto 🚀</div>
              <!-- Content with Emoji -->
              <div class="content">
                Hi there! 😃<br>
                We hope this email finds you well. We are thrilled to share some exciting news with you!<br>
                ${message}<br> <!-- This is where the 'message' variable will be inserted -->
                Our team at Themisto has been working hard to provide you with top-notch products and services, and we're delighted to have you as our valued customer.<br>
                Thank you for your continued support and trust in us! 🙏<br>
                If you have any questions or need assistance, don't hesitate to reach out. We're always here to help you!<br>
                Have a wonderful day! 😊🌟<br>
                Best regards,<br>
                Sales Team at Themisto<br>
                <span style="color: #FF5722;">Contact us: sales@themisto.com | Phone: (123) 456-7890</span>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        console.log(`Email sent successfully to ${recipient}!`);
        console.log('Message ID:', info.messageId);
        resolve();
      }
    });
  });
}


module.exports = { leadEmail };
