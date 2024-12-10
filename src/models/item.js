const joi = require('joi');

const itemSchema = joi.object({
    title : joi.string() , 
    description : joi.string().default('') ,
    image : joi.string() ,
    price : joi.number() ,
    category : joi.string() ,
    isNew : joi.boolean() ,
})

module.exports = itemSchema ;