// Imports
const express = require('express');
const { MongoClient } = require('mongodb');
const { sendEmail } = require('./schedule-mail');
const { leadEmail } = require('./lead-mail');
const ExcelJS = require('exceljs');
const fs = require('fs');
const wbm = require('wbm')
const path = require('path')
const app = express();
const bodyparser = require('body-parser')
const url = 'mongodb+srv://themisto:12345@cluster0.wcoy5xl.mongodb.net/Test?retryWrites=true&w=majority';
const port = 4000
app.use(bodyparser.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("views"))
app.use(express.static("assets"))
app.get('/shop',(req,res)=>{
    res.sendFile(path.join(__dirname,'/views/shop.html'))
})
app.get('/',(req,res)=>{
  res.sendFile(path.join(__dirname,'/views/index.html'))
})
let client;

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(url);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}

connectToDatabase();

async function authenticateUser(email, password) {
  const db = client.db();
  const collection = db.collection('user_cred');

  const user = await collection.findOne({ Email: email, Password: password });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
}

async function fetchLeadsByField(column, condition) {
  const db = client.db();
  const collection = db.collection('lead');

  const query = { [column]: condition };

  const leads = await collection.find(query).toArray();

  return leads;
}

async function fetchSchedule() {
  const db = client.db();
  const collection = db.collection('schedule');

  const schedule = await collection.find().limit(10).toArray();

  return schedule;
}

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  authenticateUser(email, password)
    .then(user => {
      res.json({ message: 'Authentication successful' });
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(404).json({ error: 'Authentication failed' });
    });
});

app.post('/leads', async (req, res) => {
  const { column, condition } = req.body;

  try {
    const leads = await fetchLeadsByField(column, condition);
    res.json(leads);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/html',(req,res)=>{
  res.sendFile(path.join(__dirname,'download.html'))
})

app.get('/schedule', (req, res) => {
  fetchSchedule()
    .then(schedule => {
      res.json(schedule);
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
});

// ...



let csvData = '';
// ...

const { Parser } = require('json2csv');

app.post('/api/fetch', async (req, res) => {
  const { column, condition, number } = req.body;

  const db = client.db();
  const collection = db.collection('lead');

  let query = {};
  let updatedCondition = condition;

  if (updatedCondition === 'empty') {
    updatedCondition = 'equal';
  }

  if (column) {
    let sortOrder = 1;

    if (updatedCondition === 'empty' && number === 'empty') {
      query = {};
    } else if (updatedCondition === 'more' || updatedCondition === 'less' || updatedCondition === 'equal') {
      let operator;
      switch (updatedCondition) {
        case 'more':
          operator = '$gt';
          sortOrder = -1;
          break;
        case 'less':
          operator = '$lt';
          sortOrder = 1;
          break;
        case 'equal':
          operator = '$eq';
          break;
        default:
          res.status(400).json({ error: 'Invalid condition' });
          return;
      }

      if (number !== 'empty') {
        let value;
        if (
          column === 'Purchase History' ||
          column === 'Click-through Rate' ||
          column === 'Email Open Rate' ||
          column === 'Average Order Value' ||
          column === 'Cart Abandonment Rate' ||
          column === 'Age'
        ) {
          value = parseFloat(number);
        } else {
          value = number;
        }

        query = {
          [column]: {
            [operator]: value,
          },
        };
      }
    } else {
      res.status(400).json({ error: 'Invalid condition' });
      return;
    }

    try {
      let documents;
      if (updatedCondition === 'equal') {
        documents = await collection.find(query).toArray();
      } else {
        documents = await collection.find(query).sort({ [column]: sortOrder }).toArray();
      }

      if (documents.length > 0) {
        // Sending the JSON data in the response
        res.status(200).json({ data: documents });

        // Converting and storing the data in CSV format
        const fields = Object.keys(documents[0]);
        const opts = { fields };
        const parser = new Parser(opts);
        csvData = parser.parse(documents);
        console.log(csvData);

        // Here, you can save the 'csvData' variable to a file or database if needed.
      } else {
        // Send an appropriate response when no data is found in the database
        res.status(404).json({ error: 'No data found' });
      }
    } catch (err) {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.status(400).json({ error: 'Column name is required' });
  }
});




const nodemailer = require('nodemailer');

// ... (Previous code)

app.post('/download', async (req, res) => {
  const { email } = req.body;

  if (csvData) {
    try {
      // Create Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      const csvRows = csvData.split('\n');
      csvRows.forEach((row) => {
        worksheet.addRow(row.split(','));
      });

      // Convert the workbook to a buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set up the nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'themisto.sales@gmail.com', // Replace with your Gmail email address
          pass: 'lwljokcbaunzaxqv', // Replace with your Gmail password or an app password
        },
      });

      // Set up the mail options
      const mailOptions = {
        from: 'themisto.sales@gmail.com', // Replace with your Gmail email address
        to: email,
        subject: 'Data Spreadsheet',
        text: `Please download the attached excel sheet with your data!!!`,
        attachments: [
          {
            filename: 'data.xlsx',
            content: buffer,
          },
        ],
      };

      // Send the email with the Excel file attachment
      await transporter.sendMail(mailOptions);

      // Provide the publicly accessible and editable spreadsheet URL as a response
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
      console.error('Error occurred while processing data:', err);
      res.status(500).json({ error: 'Failed to process data' });
    }
  } else {
    res.status(400).json({ error: 'CSV data not available' });
  }
});

// ... (Rest of the code)









// app.post('/download', async (req, res) => {
//   if (csvData) {
//     try {
//       // Create Excel workbook and worksheet
//       const workbook = new ExcelJS.Workbook();
//       const worksheet = workbook.addWorksheet('Data');
//       const csvRows = csvData.split('\n');
//       csvRows.forEach((row) => {
//         worksheet.addRow(row.split(','));
//       });

//       // Set the response headers for Excel file download
//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');

//       // Send the Excel file as the response
//       await workbook.xlsx.write(res);

//       // End the response after sending the file
//       res.end();
//     } catch (err) {
//       console.error('Error occurred while processing data:', err);
//       res.status(500).json({ error: 'Failed to process data' });
//     }
//   } else {
//     res.status(400).json({ error: 'CSV data not available' });
//   }
// });


app.post('/api/fetch-with-symbols', async (req, res) => {
  console.log(req.body);
  const { condition, number, column } = req.body;

  const db = client.db();
  const collection = db.collection('lead');

  let query = {};

  if (column) {
    if (condition === 'more' || condition === 'less') {
      const operator = condition === 'more' ? '$gt' : '$lt'; // Greater than or Less than

      let value;
      if (number !== '') {
        if (column === 'Average Order Value') {
          value = parseFloat(number.replace(/[^0-9.-]+/g, '')); // Remove symbols and convert to a numeric value
        } else {
          value = parseFloat(number);
        }

        if (!isNaN(value)) {
          query = {
            [column]: {
              [operator]: value,
            },
          };
        }
      }

      try {
        const documents = await collection.find(query).toArray();
        res.send(documents);
      } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    } else {
      // Invalid condition
      res.status(400).json({ error: 'Invalid condition' });
    }
  } else {
    // Column name is required
    res.status(400).json({ error: 'Column name is required' });
  }
});



app.post('/api/send-whatsapp', async (req, res) => {
  const { phones, message } = req.body;

  try {
    await wbm.start();
    await wbm.send(phones, message);
    await wbm.end();

    console.log('WhatsApp messages sent successfully');
    res.json({ success: true, message: 'WhatsApp messages sent successfully' });
  } catch (error) {
    console.error('Error occurred while sending WhatsApp messages:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp messages' });
  }
});

app.post('/fetch/age', async (req, res) => {
  console.log(req.body);
  const { condition, number } = req.body;
  const column = 'Age'; // Assuming the column is 'Age' by default

  const db = client.db();
  const collection = db.collection('lead');

  let query;

  if (condition === 'older') {
    query = {
      $or: [
        { [column]: { $gte: parseInt(number) } },
        { [column]: { $regex: `^[0-9]+-[0-9]*$` } }
      ]
    };
  } else if (condition === 'younger') {
    query = {
      $or: [
        { [column]: { $lte: parseInt(number) } },
        { [column]: { $regex: `^[0-9]*-[0-9]+\$` } }
      ]
    };
  } else if (condition === 'between') {
    const [min, max] = number.split('-').map(num => parseInt(num.trim()));
    query = {
      [column]: {
        $gte: min,
        $lte: max,
      },
    };
  } else {
    return res.status(400).json({ error: 'Invalid condition' });
  }

  try {
    const documents = await collection.find(query).toArray();
    res.send(documents);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ...

app.post('/send-email', (req, res) => {
  const { name, email, date, time, meet, address } = req.body;

  sendEmail(name, email, date, time, meet, address)
    .then(() => {
      res.status(200).send('Email sent successfully!');
    })
    .catch((error) => {
      console.log('Error occurred while sending email:', error.message);
      res.status(500).send('Error occurred while sending email');
    });
});
// app.post('/leadsEmails', async (req, res) => {
//   const { message, email } = req.body;

//   try {
//     await Promise.all(email.map((recipient) => leadEmail(recipient, message)));
//     res.status(200).send('Emails sent successfully!');
//   } catch (error) {
//     console.log('Error occurred while sending emails:', error.message);
//     res.status(500).send('Error occurred while sending emails');
//   }
// });

app.post('/image',async(req,res)=>{
  const category = req.body.category
  const db = client.db()
  const collection = db.collection('product_images')

  const query = {
    category : category
  }

  const data = await collection.find(query).toArray()
  res.json(data)

})

app.post('/api/send-messages', async (req, res) => {
  const { phones, message, email } = req.body;

  try {
    // Send WhatsApp Messages
    await sendWhatsAppMessages(phones, message);


    // Send Emails
    await Promise.all(email.map((recipient) => leadEmail(recipient, message)));


    res.status(200).send('Messages and mails sent successfully!');
  } catch (error) {
    console.error('Error occurred while sending messages:', error);
    res.status(500).send('Error occurred while sending messages');
  }
});

async function sendWhatsAppMessages(phones, message) {
  await wbm.start();
  await wbm.send(phones, message);
  await wbm.end();
}







// // Imports
// const { Meet } = require('@googleapis/meet');
// const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;

// // OAuth2 setup
// const oauth2Client = new OAuth2(
//   '207182417238-7edtua8rkspla3a0sh91lv6ek62jj241.apps.googleusercontent.com',
//   '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'
// );

// oauth2Client.setCredentials({
//   refresh_token: 'YOUR_REFRESH_TOKEN'
// });

// const meet = new Meet({
//   auth: oauth2Client
// });

// const bodyParser = require('body-parser');


// // Middleware
// app.use(bodyParser.json());

// // Endpoint to schedule a meeting
// app.post('/schedule-meeting', async (req, res) => {
//   try {
//     // Get IST datetime from request
//     const requestDateTimeIST = new Date(req.body.datetimeIST);

//     // Schedule meeting
//     const meeting = await meet.meetings.insert({
//       requestBody: {
//         summary: 'My Meeting',
//         start: {
//           dateTime: requestDateTimeIST.toISOString(),
//           timeZone: 'Asia/Kolkata' // Replace with the appropriate timezone
//         },
//         end: {
//           dateTime: new Date(requestDateTimeIST.getTime() + 60 * 60 * 1000).toISOString(),
//           timeZone: 'Asia/Kolkata' // Replace with the appropriate timezone
//         },
//         conferenceData: {
//           createRequest: {
//             requestId: 'uniqueId',
//             conferenceSolutionKey: {
//               type: 'hangoutsMeet'
//             }
//           }
//         }
//       }
//     });

//     // Return join URL
//     res.send({
//       joinUrl: meeting.data.conferenceData.entryPoints[0].uri
//     });
//   } catch (error) {
//     console.error('Error scheduling the meeting:', error.message);
//     res.status(500).send('Error scheduling the meeting.');
//   }
// });





// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); 
});