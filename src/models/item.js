const joi = require('joi');

const itemSchema = joi.object({
    title : joi.string() , 
    description : joi.string().default('') ,
    image : joi.string().default('') ,
    price : joi.number().default(0) ,
    category : joi.string() ,
})

module.exports = itemSchema ;