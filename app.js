const express =require('express');
const app = express();
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const ejsMate = require('ejs-mate')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const morgan = require('morgan')
const title =require('./models/title');
const card = require('./models/cards')
const { read } = require('fs');




mongoose.connect('mongodb://localhost:27017/astricx', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log("Connected to Mongoose!!");
    })
    .catch(err => {
        console.log('Got Error !!!!!');
        console.log(err);
    })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))


app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(morgan('tiny'))

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/new', (req,res )=> {
    res.render('main/title')
})
app.post('/createTitle', async(req,res) => {
   const Title = new title(req.body)
   await Title.save();
   res.render('main/cards',{Title})
})
app.get('/newCard', (req,res )=> {
    res.render('main/cards')
})
app.post('/:id/createCard', async(req,res) => {
    const {id} = req.params;
    const Title = await title.findById(id);
    const newCard = new card(req.body);
    Title.cards.push(newCard);
    await Title.save()
    await newCard.save()
    res.send('created a post successfully')
})

app.get('*', (req,res) => {
    res.status(404).send('Page Not Found !')
})

app.listen(4000, (req,res) => {
    console.log("Listning on port 4000");
})