const express = require('express');
const app = express();
const userRoutes = require('./api/user');
const login = require('./api/login');
const signup = require('./api/signup');
const admin = require('./api/admin');
const lotto = require('./api/lotto');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/login', login);
app.use('/signup', signup);
app.use('/admin', admin);
app.use('/lotto', lotto);

module.exports = app;
