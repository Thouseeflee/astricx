if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express =require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const path = require('path')
const ejsMate = require('ejs-mate')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan')
const title =require('./models/title');
const card = require('./models/cards');
const multer = require('multer');
const {storage} = require('./cloudinary');
const upload = multer({storage});
const User = require('./models/user')
const like = require('./models/likes');
const Comment = require('./models/comment')


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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('ejs', ejsMate)
app.use(methodOverride('_method'))
app.use(morgan('tiny'))


const sessionConfig = {
    name: 'session11',
    secret:'helloimsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly:true,
        // secure:true,
        expires: Date.now() + 1000 * 1 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 1 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    // res.locals.success = req.flash('success');
    // res.locals.error = req.flash('error');
    next();
})

  const ifLogged = (req,res,next) => { 
    if(!req.isAuthenticated()) {
    // req.session.returnTo = req.originalUrl;
    // req.flash('error', 'You must be Logged In');
    return res.redirect('/login');
}
next()
  }



app.get('/', async(req, res) => {
    const Title = await title.find({}).sort({totalLikes: -1});
    res.render('index',{Title})
})
app.get('/register', (req,res) =>{
    res.render('user/register')
})
app.post('/register',upload.single('profile'),async (req,res) => {
    try {
        const { email, username, password } = req.body;
        console.log(req.file);
        const {filename, path} = req.file;
        const user = new User({ email, username });
        user.profile = {url:path, filename: filename};
        const makeUser = await User.register(user, password);
        req.login(makeUser, err => {
            if (err) return next(err);
            // req.flash('success', 'Welcome to Yelp Camp');
            res.redirect('/');
        })

    } catch (e) {
        console.log(e);
        // req.flash('error', e.message);
        res.redirect('/register')
    }
})
app.get('/login', (req,res) => {
    res.render('user/login')
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),(req,res) => {
    const username=req.user.username;
    console.log(username);
    res.redirect('/')
})
app.get('/logout', (req,res) => {
    req.logOut();
    res.redirect('/login')
})
app.get('/createTitle',ifLogged, (req,res )=> {
    res.render('main/title')
})
app.post('/createTitle', ifLogged, async(req,res) => {
    const Title = new title(req.body)
    
    Title.creator = req.user.username;
    Title.creatorProfile= req.user.profile;

    await Title.save();
    res.redirect(`/${Title._id}/newCard`)
})
app.get('/:profile',ifLogged, async(req,res,next) => {
    const {profile} = req.params;
    const cardLikes = await card.find({creator: profile});
    // console.log(cardLikes.likes)
    const user = await User.find({username: profile})
    const Title = await title.find({creator:profile})
    const allTitle = await title.find({});
    const Cards = await card.find({creator:profile}).populate('title')
    if(user.length){
        res.render('user/profile',{user,Cards,Title,allTitle})
    }else{
        next();
    }
})
app.get('/:id/newCard',ifLogged, async(req,res )=> {
    const {id} = req.params;
    const fTitle = await title.findById(id);
    res.render('main/cards',{fTitle})
})
app.post('/:id/createCard',ifLogged, upload.single('image'),async(req,res) => {
    const {id} = req.params;
    const {filename, path} = req.file
    const Title = await title.findById(id);
    const newCard = new card(req.body);
    newCard.image = {url:path, filename: filename};
    newCard.creatorProfile = req.user.profile;
    newCard.title = Title._id;
    newCard.creator = req.user.username;
    await newCard.save();
    res.redirect(`/${Title._id}/show`)
})

app.get('/:id/show', async(req,res) => {
    const {id} = req.params;
    const Title = await title.findById(id);
    const Cards = await card.find({title : id}).sort({numOfLikes: -1})
    // if(req.user){
    //     const userId = req.user._id;
    // }
    if(req.user){
    const userId = req.user._id;
    const Like = await like.find({title : id, creator: userId})
    res.render('show',{Title, Cards, Like})
    }else{
        res.render('show',{Title, Cards})
    }
})
app.get('/:id/show/:cardId', ifLogged, async(req,res) => {
    const {id,cardId} = req.params;
    const Card = await card.findById(cardId)
    const comment = await Comment.find({card: cardId})
    res.render('comments',{id,cardId,Card,comment})
})

app.post('/:id/show/:cardId/comments', ifLogged, async(req,res) => {
    const {id,cardId} = req.params;
    const Card = await card.findById(cardId);
    console.log(Card);
    const newComment = new Comment(req.body);
    // newComment.comment =  
    newComment.card = cardId; 
    newComment.creatorProfile= req.user.profile;
    newComment.user = req.user.username;
    newComment.title = id;
    Card.numOfComment += 1;
    await newComment.save()
    await Card.save();
    // res.redirect(`/${id}/show/${cardId}`)
    res.send(req.body)
})
app.delete('/:id/show/:cardId/comments/:cId', async(req,res) => {
    const {id,cardId,cId} = req.params;
    const commentDel = await Comment.findByIdAndDelete(cId);
    const Card = await card.findById(cardId);
    if(Card.numOfComment > 0){
        Card.numOfComment -= 1;
    }
    await Card.save()
})
app.get('/:id/show/:cardId/likes',ifLogged, async(req,res) => {
    const {id, cardId} = req.params;
    const Likes = new like({})
    const Like = await like.findOne({card: cardId})
    const Cards = await card.findById(cardId);
    const user = req.user.username;
    
    const Title = await title.findById(id)
    const Kards = await card.find({title: id});
    console.log(Kards);
    let likes = 0;
    let disLike = 0;
    for(let like of Kards){
        likes += like.numOfLikes
    }
    console.log(likes);

    if(!Cards.likes.includes(user)){
        Likes.creator = user;
        Likes.title = id;
        Likes.card = cardId;
        Cards.likes.push(user);
        Cards.numOfLikes += 1
        Title.totalLikes += 1 ;
    await Likes.save();
    await Cards.save();
    await Title.save();
    res.send({
        totalLikes: Cards.likes.length
    });
    // res.redirect(`/${id}/show`)
    } else {
        await Like.remove();
        let idx = Cards.likes.indexOf(user);
        Cards.likes.splice(idx, 1);
        Cards.numOfLikes -= 1;
        Title.totalLikes -= 1;
        Cards.save();
        Title.save();
        res.send({
            totalLikes: Cards.likes.length
        })
        
    }
    // res.redirect(`/${id}/show`)
})

app.delete('/:cardId', async(req,res) =>{
    const {cardId} = req.params;
    const username = req.user.username;
    const deleteCard = await card.findByIdAndDelete(cardId) 
    res.redirect(`/${username}`)
})

app.get('*', (req,res) => {
    res.status(404).send('Page Not Found !')
})

app.listen(4000, (req,res) => {
    console.log("Listning on port 4000");
})