const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
//This is our basic schema for the entire YelpCamp model. 


//https://res.cloudinary.com/dl0kirh4g/image/upload/v1636091837/YelpCamp/pxjw6if2lvo4oiw8ic05.png

const ImageSchema = new Schema({ // we are doing this bec the cloudinary thumbnail property is needed and we can add that only on a schema and we need it for each image

    url: String,
    filename: String
})
const opts = { toJSON: { virtuals: true } };

ImageSchema.virtual('thumbnail').get(function () { //virtual can only be used on a schema

    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [
        ImageSchema
    ],



    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)


CampgroundSchema.virtual('properties.popUpMarkup').get(function () { //virtual can only be used on a schema
    const title = (this.title);
    return `<h6> Here is ${title}</h6>`
});




CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }

})

module.exports = mongoose.model('Campground', CampgroundSchema);