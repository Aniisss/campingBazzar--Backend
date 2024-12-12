const Joi = require('joi');


const userSchema = Joi.object({
    userName : Joi.string() ,
    isAdmin : Joi.boolean().default(false),
});


module.exports = userSchema;
