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
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync')
const {isCreator, commentCreator, validateTitle, validateCard, validateComment, titleCreator} =require('./middleware')
const { CloudinaryStorage, cloudinary } = require('./cloudinary');
const { findByIdAndDelete, findById } = require('./models/likes');
// const database = process.env.DATABASE_URL;
const dbUrl = 'mongodb://localhost:27017/ashtrics';
const MongoStore = require('connect-mongo')



mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
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

const secret = process.env.SECRET || "QWROIASDFJLASVMAKDZFASEEWAQ"

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

const sessionConfig = {
    store,
    name: 'Ashtrics',
    secret,
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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
  const ifLogged = (req,res,next) => {
    if(!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'please Login or Signup');
    return res.redirect('/login');
}
next()
  }

  app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.get('/sitemap.xml', function(req, res) {
    res.sendFile('C:/Users/Thouseef Lee/astricx/views/sitemap.xml');
    });
app.get('/', catchAsync(async(req, res) => {
    const Title = await title.find({}).sort({totalLikes: -1});
    res.render('index',{Title})
}))
app.get('/register', (req,res) =>{
    res.render('user/register')
})
app.post('/register',upload.single('profile'),catchAsync(async (req,res) => {
    try {
        const { email,name,username, password } = req.body;
        console.log(req.file);
        const {filename, path} = req.file;
        const user = new User({ email, username, name});
        user.profile = {url:path, filename: filename};
        const makeUser = await User.register(user, password);
        req.login(makeUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Ashtrics');
            res.redirect('/');
        })
    } catch (e) {
        console.log(e);
        req.flash('error', e.message);
        res.redirect('/register')
    }
}))
app.get('/login', (req,res) => {
    res.render('user/login')
})
app.post('/login', passport.authenticate('local', { failureFlash: true,failureRedirect: '/login' }),(req,res) => {
    const url = req.session.returnTo || '/'
    delete req.session.returnTo
    res.redirect(`${url}`)
})
app.get('/logout', (req,res) => {
    req.flash('error', 'Logged out')
    req.logOut();
    res.redirect('/login');
})
app.get('/createTitle',ifLogged, (req,res )=> {
    res.render('main/title')
})
app.post('/createTitle', ifLogged, validateTitle,catchAsync(async(req,res) => {
    const Title = new title(req.body)

    Title.creator = req.user.username;
    Title.creatorProfile= req.user.profile;

    await Title.save();
    res.redirect(`/${Title._id}/newCard`)
}))
app.get('/cLikes/:cId', catchAsync(async(req,res) =>{
    const {cId} = req.params;
    const comment = await Comment.findById(cId);
    const user = req.user.username
    if(!comment.likes.includes(user)){
        comment.likes.push(user)
        await comment.save();
        res.send({
            totalLikes: comment.likes.length
        })
    }else{
        let idx = comment.likes.indexOf(user)
        comment.likes.splice(idx, 1)
        comment.save()
        res.send({
            totalLikes: comment.likes.length
        })
    }
}))
app.get('/:profile',ifLogged,catchAsync(async(req,res,next) => {
    const {profile} = req.params;
    const user = await User.find({username: profile})
    const Title = await title.find({creator:profile})
    const allTitle = await title.find({});
    const Cards = await card.find({creator:profile}).populate('title')
    if(user.length){
        res.render('user/profile',{user,Cards,Title,allTitle})
    }else{
        next();
    }
}))
app.post('/:profile/image',upload.single('profile'), async(req,res) =>{
    const {profile} = req.params
    const {filename,path} = req.file
    const user = await User.findOne({username: profile})
    const Title = await title.find({creator: profile})
    const Card = await card.find({creator:profile})
    console.log(user.profile.filename)
    await cloudinary.uploader.destroy(user.profile.filename);
    for(let head of Title){
        head.creatorProfile = {url:path , filename:filename}
        await head.save()
    }
    for(let c of Card){
        c.creatorProfile = {url:path , filename:filename}
        await c.save()
    }
    user.profile = {url:path , filename:filename}
    console.log(Title);
    await user.save()
    console.log(user.profile);
  res.redirect(`/${profile}`)
})
app.get('/:id/newCard',ifLogged,catchAsync(async(req,res )=> {
    const {id} = req.params;
    const fTitle = await title.findById(id);
    res.render('main/cards',{fTitle})
}))
app.post('/:id/createCard',ifLogged, upload.single('image'),catchAsync(async(req,res) => {
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
}))

app.get('/:id/show',catchAsync(async(req,res) => {
    const {id} = req.params;
    const Title = await title.findById(id);
    const Cards = await card.find({title : id}).sort({numOfLikes: -1})
    if(req.user){
    const userId = req.user._id;
    const Like = await like.find({title : id, creator: userId})
    res.render('show',{Title, Cards, Like})
    }else{
        res.render('show',{Title, Cards})
    }
}))
app.get('/:id/show/:cardId', ifLogged, catchAsync(async(req,res) => {
    const {id,cardId} = req.params;
    const Card = await card.findById(cardId)
    const comment = await Comment.find({card: cardId})
    res.render('comments',{id,cardId,Card,comment})
}))
app.post('/:id/show/:cardId/comments', ifLogged,validateComment, catchAsync(async(req,res) => {
    const {id,cardId} = req.params;
    const Card = await card.findById(cardId);
    console.log(Card);
    const newComment = new Comment(req.body);
    newComment.card = cardId;
    newComment.creatorProfile= req.user.profile;
    newComment.user = req.user.username;
    newComment.title = id;
    Card.numOfComment += 1;
    await newComment.save()
    await Card.save();
    res.send({
        info: newComment,
        pic: req.user.profile.profile
    })
}))
app.delete('/:id/show/:cardId/comments/:cId',commentCreator,catchAsync(async(req,res) => {
    const {id,cardId,cId} = req.params;
    const commentDel = await Comment.findByIdAndDelete(cId);
    const Card = await card.findById(cardId);
    if(Card.numOfComment > 0){
        Card.numOfComment -= 1;
    }
    await Card.save()
}))
app.get('/:id/show/:cardId/likes',ifLogged, catchAsync(async(req,res) => {
    const {id, cardId} = req.params;
    const Likes = new like({})
    const Like = await like.findOne({card: cardId})
    const Cards = await card.findById(cardId);
    const user = req.user.username;
    const Title = await title.findById(id)
    const Kards = await card.find({title: id});
    let likes = 0;
    for(let like of Kards){
        likes += like.numOfLikes
    }
    if(!Cards.likes.includes(user)){
        Likes.creator = user;
        Likes.title = id;
        Likes.card = cardId;
        Cards.likes.push(user);
        Cards.numOfLikes += 1
        Title.totalLikes += 1 ;
        await  Cards.save();
           Likes.save();
          Title.save();
    res.send({
        totalLikes: Cards.likes.length
    });
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
}))
app.delete('/:id/delete/:cardId',ifLogged,isCreator,catchAsync(async(req,res) =>{
    const {id,cardId} = req.params;
    const username = req.user.username;
    const Title = await title.findById(id)
    const Card = await card.findById(cardId)
    Title.totalLikes -= Card.numOfLikes
    await Title.save()
    await cloudinary.uploader.destroy(Card.image.filename)
    await card.findByIdAndDelete(cardId)
    res.redirect(`/${username}`)

}))
app.delete('/:id/deleteTitle',titleCreator, async(req,res) => {
    const {id} = req.params;
    const Card = await card.find({title: id})
    for(let file of Card){
        await cloudinary.uploader.destroy(file.image.filename)
    }  
    await title.findByIdAndDelete(id);
    res.redirect(`/`)
})
app.all('*', (req, res, next) => {
    next(new ExpressError('404 Page Not Found', 404))
})
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong'
    res.status(status).render('error', { err })
})
const port = process.env.PORT || 4000
app.listen(port, (req,res) => {
    console.log(`Listning on port ${port}`);
})