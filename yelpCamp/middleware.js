const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressErrors');
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //store the url they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'YOU MUST BE SIGNED IN FIRST!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


module.exports.isAuthor = async (req, res, next) => {

    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();

}



module.exports.validateReview = (req, res, next) => {   //middle ware to validate our review form

    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


module.exports.isReviewAuthor = async (req, res, next) => {

    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();

}
