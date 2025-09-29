const nodemailer = require("nodemailer");
// const sgTransport = require("nodemailer-sendgrid");
// const postmark = require("postmark");
// const client = new postmark.ServerClient(process.env.POSTMARK_TOKEN);
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const fs = require("fs");
const ejs = require("ejs");
const websiteName = 'TheNetFi'
const websiteLink = 'thenetfi.com'
const websiteSupportMail = 'support@thenetfi.com';


// Universal function to render EJS template and send email
const sendEmail = async (templatePath, to, subject, templateData, attachments = []) => {
  try {
    const html = await ejs.renderFile(templatePath, templateData);

    const data = await resend.emails.send({
      from: `${templateData.websiteName} <${process.env.CUSTOMMAIL}>`,
      to,
      bcc: process.env.CUSTOMMAIL,
      subject,
      html,
      attachments,
    });

    console.log("Resend response:", data);
  } catch (error) {
    console.log("Email not sent:", error);
  }
};

// ======================
// Mail functions
// ======================

module.exports.welcomeMail = async (email, subject, text, otpcode) => {
  await sendEmail(
    "views/mail/welcomemail.ejs",
    email,
    subject,
    { username: text, otpcode, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.otpMail = async (email, subject, text, otpcode) => {
  await sendEmail(
    "views/mail/otpmail.ejs",
    email,
    subject,
    { username: text, otpcode, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.emailActMail = async (email, subject, text, username) => {
  await sendEmail(
    "views/mail/emailactmail.ejs",
    email,
    subject,
    { link: text, username, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.passwordResetMail = async (email, subject, text, username) => {
  await sendEmail(
    "views/mail/passwordresetmail.ejs",
    email,
    subject,
    { link: text, username, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.verifyMail = async (email, subject, username) => {
  await sendEmail(
    "views/mail/verifymail.ejs",
    email,
    subject,
    { username, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.acctVerifiedMail = async (email, subject, username) => {
  await sendEmail(
    "views/mail/acctverifiedmail.ejs",
    'mileshost5@gmail.com',
    subject,
    { username, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.acctUpgradeMail = async (email, subject, username, accounttype) => {
  await sendEmail(
    "views/mail/acctupgrademail.ejs",
    email,
    subject,
    { username, accounttype, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.signalMail = async (email, subject, username, signalname) => {
  await sendEmail(
    "views/mail/signalmail.ejs",
    email,
    subject,
    { username, signalname, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.depositMail = async (email, subject, username, fundedAmount) => {
  await sendEmail(
    "views/mail/depositmail.ejs",
    email,
    subject,
    { username, amount: fundedAmount, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.declinedepositMail = async (email, subject, username, fundedAmount) => {
  await sendEmail(
    "views/mail/declineddepositmail.ejs",
    email,
    subject,
    { username, amount: fundedAmount, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.openInvestmentMail = async (email, subject, username, packagetype, investedamount) => {
  await sendEmail(
    "views/mail/openinvestment.ejs",
    email,
    subject,
    { username, packagetype, investedamount, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.endInvestmentMail = async (email, subject, username, packagetype, investedamount, profit) => {
  await sendEmail(
    "views/mail/closeinvestment.ejs",
    email,
    subject,
    { username, packagetype, investedamount, profit, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.endCopyTrade = async (email, subject, username) => {
  await sendEmail(
    "views/mail/endcopytrade.ejs",
    email,
    subject,
    { username, subject, websiteName, websiteLink, websiteSupportMail }
  );
};

module.exports.withdrawMail = async (email, subject, username, amount) => {
  await sendEmail(
    "views/mail/withdrawmail.ejs",
    email,
    subject,
    { username, amount, subject, websiteName, websiteLink, websiteSupportMail }
  );
};



