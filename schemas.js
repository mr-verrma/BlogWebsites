const Joi  = require('joi');

module.exports.BlogSchema = Joi.object({
        title:Joi.string(),
        content:Joi.string()
    }).required()
