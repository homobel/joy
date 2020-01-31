const path = require('path');
const express = require('express');
const joy = require('../../index'); require('./fix'); // make it work inside package
const app = express();

app.engine('joy', joy.express);
app.set('view engine', 'joy');
app.set('views', path.join(__dirname, './views'));

app.get('/', (req, res) => {
    res.render('index', {name: 'world'});
});

app.get('/non-valid', (req, res) => {
    res.render('non-valid');
});

module.exports = app;
