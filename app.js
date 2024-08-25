// app.js
const express = require('express');
// const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./api/user');
const login = require('./api/login');
const signup = require('./api/signup');
const admin = require('./api/admin');

// app.use(bodyParser.json());
app.use(express.json());
app.use('/users', userRoutes);
app.use('/login', login);
app.use('/signup',signup);
app.use('/admin',admin);

module.exports = { app };
