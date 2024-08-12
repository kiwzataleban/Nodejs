// app.js
const express = require('express');
const app = express();
const userRoutes = require('./api/user');
const login = require('./api/login');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/login', login);

module.exports = { app };
