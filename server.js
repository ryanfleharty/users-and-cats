const express = require('express');
const app = express();
const userController = require('./controllers/userController');
const catsController = require('./controllers/catsController');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
require('./db/db');

app.get('/', (req, res)=>{
    res.render("index.ejs");
})

app.use('/users', userController);
app.use('/cats', catsController);

app.listen(3000, ()=>{
    console.log("server is go");
})