const mongoose = require('mongoose'); //using mongoose
const Campground = require('../models/campground'); //using our campgrounds model 
const cities = require('./cities'); //the database of cities we created
const { places, descriptors } = require('./seedHelpers'); //the database of names that we are gonna use to 
//create random names for our models



mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
//basic connection for mongoose


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})
//checked if our mongoose model is connect

const sample = array => array[Math.floor(Math.random() * array.length)]; //create our sample array of given length

const seedDB = async () => {
    await Campground.deleteMany({});//deleteing our entire database
    for (let i = 0; i < 10; i++) {
        const random1000 = Math.floor(Math.random() * 1000); //generate a random number for location
        const price = Math.floor(Math.random() * 2000) + 10; //generate random number for price
        const camp = new Campground({
            author: '6182789ba7ef98fa6ccb0c3b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dl0kirh4g/image/upload/v1636198915/YelpCamp/wmhgk8amzukf2dy0syuh.png',
                    filename: 'YelpCamp/m0obvhxz9wswfzwqwa3w'
                },
                {
                    url: 'https://res.cloudinary.com/dl0kirh4g/image/upload/v1636198913/YelpCamp/mdgnxsah4kvngzussfcq.png',
                    filename: 'YelpCamp/yqflv2hbtyhz3jtln3vu'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.Iste quaerat, eum dicta magnam earum labore debitis, aperiam voluptatem, consectetur aliquam architecto consequuntur et nihil repudiandae maiores non veniam numquam reiciendis?Lorem ipsum dolor sit amet consectetur, adipisicing elit.Culpa, ab at commodi accusamus soluta nam facere provident, vero, magnam sint vel! Iure eaque illo rerum id ducimus unde quisquam!',
            price: price,
            geometry: {
                "type": "Point",
                "coordinates": [
                    cities[random1000].longitude, cities[random1000].latitude
                ]
            }

        })
        await camp.save(); //awaited bec async function
    }
}

seedDB().then(() => {
    mongoose.connection.close(); //to automatically close the mongoose conection once the database is generated
})