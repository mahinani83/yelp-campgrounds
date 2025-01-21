const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const campgroundShema = new Schema({
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    title:String,
    price:Number,
    image:String,
    location:String,
    description:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }]
});


campgroundShema.post('findOneAndDelete',async function(campground){
    if(campground.reviews){
        await review.deleteMany({
            _id:{
                $in:campground.reviews
            }

        })

    }
})

module.exports = mongoose.model('Campground',campgroundShema);