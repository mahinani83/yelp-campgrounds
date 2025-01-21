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
  for (let i = 0; i < 50; i++) {
    const randNumber = Math.floor(Math.random() * 1000);
    const randCity = cities[randNumber];
    const c = new Campground({
      author:'6789c8befcb2e9b9be804e11',
      title:randCity.city,
      price : randNumber , 
      image : `https://picsum.photos/400?random=${Math.random()}`,
      location:`${randCity.city},${randCity.state}`,
      description:"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Commodi corporis quibusdam magnam, eaque a numquam. Obcaecati eum dolores quo provident asperiores vitae doloremque cupiditate rem! Necessitatibus eius voluptatem nobis illo."
    });
    await c.save();
  }
};
seedDB().then(()=>{
  mongoose.connection.close();
});
