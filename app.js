const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
var mysql = require('mysql')
require('dotenv').config();
const app= express();

//view engine setup
app.use(bodyParser.urlencoded({extended:false}))
app.set('view engine', 'pug')

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME
  })
  
connection.connect(function(err){
    if(err) throw err;
    console.log('connection established');
  });

 
 app.get('/', function (req, res) {
    res.sendFile('index.html', {root : __dirname })
  });


app.post('/submit',(req,res)=>{
  var sql="insert into user_info values('"+ req.body.fname +"','"+ req.body.lname +"','"+ req.body.dateOfBirth +"','"+ req.body.email +"',"+ req.body.phone +",0)"
    connection.query(sql,function(err){
      if(err) throw err;
    })
    
    const output = `
     <ul>  
      <li>Hii ${req.body.fname}</li>
    </ul>
    <p>Thank you for registering!</p>`;

  // create reusable transporter object using the default SMTP transport
   var transporter = nodemailer.createTransport({
    service:'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SENDER_EMAIL, // generated ethereal user
        pass: process.env.SENDER_EMAIL_PASSWORD // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  var mailOptions = {
      from: '"Ashwini"<process.env.SENDER_EMAIL>', // sender address
      to: req.body.email, // list of receivers
      subject: 'Online application registration', // Subject line
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
    
      console.log('Message sent: %s', info.messageId);   
      //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('index',{title:'Email sent',message:'Thank you for registering!'});
  });
  });
app.listen(3000, () => console.log('Server started...'));
