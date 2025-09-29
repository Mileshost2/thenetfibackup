const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const websiteName = 'TheNetFi'
const websiteLink = 'thenetfi.com'
const websiteSupportMail = 'info@thenetfi.com';


module.exports.sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/mailview.ejs", {mail: text, subject: subject},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

// module.exports = sendEmail;

module.exports.welcomeMail = async (email, subject, text, otpcode) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/welcomemail.ejs", {username: text, subject: subject, otpcode, websiteName, websiteLink, websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.otpMail = async (email, subject, text, otpcode) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/otpmail.ejs", {username: text, subject: subject, otpcode, websiteName, websiteLink, websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.emailActMail = async (email, subject, text, username, websiteName, websiteLink, websiteSupportMail) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/emailactmail.ejs", {link: text, subject: subject, username: username},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.passwordResetMail = async (email, subject, text, username) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/passwordresetmail.ejs", {link: text, subject: subject, username: username, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.verifyMail = async (email, subject, username, websiteName, websiteLink, websiteSupportMail) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/verifymail.ejs", {subject: subject, username: username},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.acctVerifiedMail = async (email, subject, username) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/acctverifiedmail.ejs", {subject: subject, username: username, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.acctUpgradeMail = async (email, subject, username, accounttype) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/acctupgrademail.ejs", {subject: subject, username: username, accounttype: accounttype, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.signalMail = async (email, subject, username, signalname) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/signalmail.ejs", {subject: subject, username: username, signalname: signalname, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.depositMail = async (email, subject, username, fundedAmount) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/depositmail.ejs", {amount: fundedAmount, subject: subject, username: username, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.declinedepositMail = async (email, subject, username, fundedAmount) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/declineddepositmail.ejs", {amount: fundedAmount, subject: subject, username: username, websiteName: websiteName, websiteLink: websiteLink, websiteSupportMail: websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.openInvestmentMail = async (email, subject, username, packagetype, investedamount) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/openinvestment.ejs", {packagetype: packagetype, investedamount: investedamount, subject: subject, username: username, websiteName, websiteLink, websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.endInvestmentMail = async (email, subject, username, packagetype, investedamount, profit) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/closeinvestment.ejs", {packagetype: packagetype, profit: profit, investedamount: investedamount, subject: subject, username: username, websiteName, websiteLink, websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports.withdrawMail = async (email, subject, username, amount) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        ejs.renderFile("views/mail/withdrawmail.ejs", {amount: amount, subject: subject, username: username, websiteName, websiteLink, websiteSupportMail},function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: `${websiteName} <${process.env.CUSTOMMAIL}>`,
                    to: email,
                    subject: subject,
                    html: data
                };
                console.log("html data ======================>", mainOptions.html);
                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
            });
    } catch (error) {
        console.log(error, "email not sent");
    }
};