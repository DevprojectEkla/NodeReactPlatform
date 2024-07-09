const { sendSuccess,collectRequestData, parseMultiPartDataIntoKeyValue, failure } = require('../helpers/manipulateData')

const nodemailer = require("nodemailer")

 function sendMail  (req, res) {
    collectRequestData(req, async (body) => {console.debug("Mail send",body)
      const mail = parseMultiPartDataIntoKeyValue(body)
        console.log("Mail object:", mail)

    
 const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 25,
        secure: false, // true for 465, false for other ports
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: mail.mailFrom,
        to: process.env.GOOGLE_USER, // Your email where you want to receive emails
        subject: 'New Contact Form Submission',
        text: mail.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        sendSuccess(res,res.body);
    } catch (error) {
        console.error('Error sending email:', error);
        failure(res,error);
    }   }

)




}

module.exports = {sendMail}
