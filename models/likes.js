const mongoose =require('mongoose')
const Schema=mongoose.Schema;

const likesSchema =new Schema({
    creator:{
        type: String,
        required: true
    },
    title:{
        type: Schema.Types.ObjectId,
        ref: 'Title'
    },
    card:{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }
})


module.exports = mongoose.model('Like', likesSchema)