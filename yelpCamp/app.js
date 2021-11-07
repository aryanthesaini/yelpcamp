if (process.env.NODE_ENV !== "production") { //we are basically saying that if we are in development mode,
    require('dotenv').config();// then and only then we should require the dotenv 
}

const express = require('express'); //using expressJS
const path = require('path');//path so we can set up default path for our directories(views)
const mongoose = require('mongoose'); //using mongoose to make a link bw node and express
const ejsMate = require('ejs-mate'); //ejs-Mate to use and render ejs files
const { campgroundSchema, reviewSchema } = require('./schemas.js'); //getting our main schema for campground's server side validation
const Campground = require('./models/campground') //campground main schema
const ExpressError = require('./utils/ExpressErrors') //getting the Express error we defined in another file
const methodOverride = require('method-override'); //to change (override) the get and post req, to put and others
const catchAsync = require('./utils/catchAsync'); //catching our async errors
const Review = require('./models/review'); //we need our review model
const campgroundRoutes = require('./routes/campgrounds');//used the router to clear main app.js for all camogrounds reqs
const reviewRoutes = require('./routes/reviews');//used the router to clear main app.js for all reviews reqs
const session = require('express-session'); //session and 
const flash = require('connect-flash');//flash
const passport = require('passport'); //passport for authentication
const LocalStratergy = require('passport-local');//passport for local authentication
const User = require('./models/user'); //the user model we created
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize'); // to avoid mongo injectiopn
const helmet = require('helmet'); //for allowing only specific sources to upload data

const MongoDBStore = require("connect-mongo");



const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//connecting the basic mongoose model


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})
//checking if the database is connected

const app = express(); //starting express


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); //setting up default location for access 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); //to work with forms
app.use(methodOverride('_method')); //overriding get and post req to update and create new forms


const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
});

store.on("error", function (e) {
    console.log("Session store error", e);
})


const sessionConfig = {
    store,
    name: 'aryan',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://api.mapbox.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://maxcdn.bootstrapcdn.com/bootstrap",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dl0kirh4g/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());

passport.use(new LocalStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // console.log(req.session.passport);

    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes);





app.get('/', (req, res) => {
    res.render('home');
})




app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something is not right :(';
    res.status(statusCode).render('error', { err });
    //res.send("Something went wrong :(");
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port 3000 ${port}`);
})