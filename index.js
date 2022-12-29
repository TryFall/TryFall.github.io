const session = require("express-session");
const filestore = require("session-file-store")(session);
const get_ip = require('ipware')().get_ip;
const Parser = require("body-parser");
const crypto = require("crypto-js");
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');
const app = express();

//MiddleWare
app.use(Parser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/resources/public')));
  app.use(helmet({
    XContentTypeOptions: false
  }));
app.use(session({
  name: "session-id",
  secret: "Test123", // Secret key,
  saveUninitialized: false,
  resave: false,
  store: new filestore()
}));

//Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env['URL'], { useNewUrlParser: true, useUnifiedTopology: true });
const Client = require('./resources/Database/Mongoose');

//Errors
const errors = ["Incorrect Username or Password", "Please Enter a Valid Email", "You already own an account."];

//Web Pages
app.get('/', (req, res) => { res.redirect('/home') });
app.get('/:page', (req, res) => {
  const format = req.body;
  if (req.params.page === 'register') {
    res.sendFile(path.join(__dirname +'/resources/public/register.html'));
  } else if (req.params.page === 'login') {
    res.sendFile(path.join(__dirname +'/resources/public/login.html'));
  } else if (req.params.page === 'home') {
    res.sendFile(path.join(__dirname + '/resources/public/home.html'));
  } else if (req.params.page === 'support') {
    res.sendFile(path.join(__dirname + '/resources/public/support.html'));
  } else {
    res.sendStatus(404);
  }
});

//Database & Autherization Middleware
app.all('/auth/:method', (req, res) => {
  var format = req.body;
  var ip_info = get_ip(req);
  function xor(a,b) {
    let c = "";
    for (let i = 0; i < a.length; i++) {
       c += `${String.fromCharCode(a.charCodeAt(i)^b)}`
    }
    return c;
}
var encrypted = xor(ip_info.clientIp, process.env['KEY']);
  var pasxor = xor(format.password,process.env['KEY']);
  if (req.params.method==='login') {
    Client.find({username: format.username}).then((result) => {
      if (null) {
        res.send(errors[0]);
      } else if (result[0].password===pasxor) {
        res.setHeader('set-cookie', format.username);
        res.redirect('/home');
      } else {
        res.send(errors[0]);
      } 
    });
  } else if (req.params.method==='register') {
    Client.find({id: encrypted}).then((result) => {
      if (result[0]) {
        res.send(errors[2]);
      } else {
        const User = new Client({
        username: format.username,
        password: pasxor,
        id: encrypted
      });
      User.save();
      res.setHeader('set-cookie', format.username);
      res.redirect('/home');  
      }
    });
}
});
app.listen(3000);