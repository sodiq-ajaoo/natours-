// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

// new Email(user, url).sendwelcome()
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `sodiq Hammed  <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //   return nodemailer.createTransport({
      //     host: 'smtp-relay.brevo.com',
      //     port: 587,
      //     auth: {
      //       user: process.env.EMAIL_USERNAME,
      //       pass: process.env.EMAIL_PASSWORD,
      //     },
      //   });
      // }
      // console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
      // console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);
      // console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        //  secure: true, // IMPORTANT
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // active in gmail lass secure app option
    });
  }
  //send the actual email
  async send(template, subject) {
    // 1 render html based on a pug tenplate
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2 define the email options
    // const mailOptions = {
    //   from: this.from,
    //   to: this.to,
    //   subject,
    //   html,
    //   text: htmlToText.fromString(html),

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // };
    //3create a transport and send email
    this.newTransport();
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to the natours family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
