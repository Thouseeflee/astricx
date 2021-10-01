const card = require('./models/cards');
const Comment =require('./models/comment');
const {titleSchema, cardSchema,commentSchema} =require('./schemas.js')
const ExpressError = require('./utils/ExpressError')



module.exports.isCreator = async (req, res, next) => {
    const { cardId } = req.params;
    const Card = await card.findById(cardId);
    if (Card.creator !== req.user.username) {
        req.flash('error', 'You dont have permission to do that !');
        return res.redirect(`/${Card.creator}`)
    }
    next()
}

module.exports.commentCreator = async (req, res, next) => {
    const { cId } = req.params;
    const comment = await Comment.findById(cId);
    if (comment.user !== req.user.username) {
        req.flash('error', 'You dont have permission to do that !');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateTitle = (req, res, next) => {
    const { error } = titleSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
module.exports.validateCard = (req, res, next) => {
    const { error } = cardSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
module.exports.validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}