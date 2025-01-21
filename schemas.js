const joi = require('joi');



module.exports.campgroundSchema = joi.object({
        campground:joi.object({
            title:joi.string().required(),
            price:joi.number().min(0).required(),
            image:joi.string().required(),
            location:joi.string().required(),
            description:joi.string().required(),

        }).required()
    })


module.exports.reviewSchema = joi.object({
    review:joi.object({
        description:joi.string().required(),
        rating:joi.number()
    }).required()
})
 




