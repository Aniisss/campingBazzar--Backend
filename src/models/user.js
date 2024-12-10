const Joi = require('joi');


const userSchema = Joi.object({
    userName : Joi.string().required() ,
    email : Joi.string().email() ,
    isAdmin : Joi.boolean().default(false),
});


module.exports = userSchema;
