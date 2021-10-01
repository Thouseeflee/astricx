const basejoi = require("joi")
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const joi = basejoi.extend(extension)


module.exports.titleSchema = joi.object({
    title: joi.string().required().max(32).escapeHTML()
}).required()

// module.exports.cardSchema = joi.object({
//     name: joi.string().required().escapeHTML(),
//     about: joi.string().required().max(36).escapeHTML()
// })

module.exports.commentSchema = joi.object({
    comment: joi.string().required().max(150).escapeHTML()
}).required()