const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const Campground = require("../models/Campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("database connected");
});

const seedDB = async () => {
  await Campground.deleteMany({});
  const randPrice = Math.floor((Math.random * 30) + 1);
  for (let i = 0; i < 100; i++) {
    const randNumber = Math.floor(Math.random() * 1000);
    const randCity = cities[randNumber];
    const c = new Campground({
      author:'6789c8befcb2e9b9be804e11',
      title:randCity.city,
      price : randNumber , 
      images: [
        {
          url: 'https://res.cloudinary.com/dnysz92qi/image/upload/v1738003385/yelp-camp/iouxudfsxbyfu0dm3syj.jpg',
          filename: 'yelp-camp/iouxudfsxbyfu0dm3syj',
        },
        {
          url: 'https://res.cloudinary.com/dnysz92qi/image/upload/v1738003386/yelp-camp/nibdy6xnpkwiego8tiik.jpg',
          filename: 'yelp-camp/nibdy6xnpkwiego8tiik',
        }
      ],
      geometry: {
        type: 'Point',
        coordinates: [randCity.longitude, randCity.latitude]
      },
      location:`${randCity.city},${randCity.state}`,
      description:"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Commodi corporis quibusdam magnam, eaque a numquam. Obcaecati eum dolores quo provident asperiores vitae doloremque cupiditate rem! Necessitatibus eius voluptatem nobis illo."
    });
    await c.save();
  }
};
seedDB().then(()=>{
  mongoose.connection.close();
});
