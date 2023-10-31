const nodemailer = require("nodemailer");
const path = require('path');
const fs = require('fs');

const compileEmailContent = function(otp) {
  const currentModuleURL = module.parent.filename;
  const currentModulePath = path.dirname(currentModuleURL);
  const htmlFilePath = path.join(currentModulePath, '..', 'utils', 'otpmail.html');
  const htmlTemplate = fs.readFileSync(htmlFilePath, 'utf8');
  const compiledHTML = htmlTemplate.replace('${otp}', otp);
  return compiledHTML;
};

module.exports = compileEmailContent;


const sendmail = (senderMail, senderPassword, receiverMail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderMail,
      pass: senderPassword,
    },
  });

  const mailOptions = {
    from: senderMail,
    to: receiverMail,
    subject: "Hirez Verification Code",
    html: compileEmailContent(otp),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendmail;
