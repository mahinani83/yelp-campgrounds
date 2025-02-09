const mongoose = require('mongoose');
const review = require('./review');
const { urlencoded } = require('express');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } }; 

const imageSchema = Schema({
    url:String,
    filename:String
},opts);

//this is to include virtual properties in the response

//https://res.cloudinary.com/dnysz92qi/image/upload/v1738178108/yelp-camp/xgqaf0yhkvgus48m8huc.jpg

imageSchema.virtual('thumbnail').get(function(){ //this is a virtual property to resize the image
    return this.url.replace('/upload','/upload/w_200');
})  


const campgroundSchema = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    images:[imageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    title:String,
    price:Number,
    location:String,
    description:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }]
},opts);


campgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground.reviews){
        await review.deleteMany({
            _id:{
                $in:campground.reviews
            }

        })

    }
})

campgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campground/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`
})

module.exports = mongoose.model('Campground',campgroundSchema);