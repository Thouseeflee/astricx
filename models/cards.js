const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const title =require('./title')

const cardSchema =new Schema({
    name:{
        type:String,
        required: true
    },
    about:{
        type:String,
        required: true
    },
    title:{
        type: Schema.Types.ObjectId,
        ref: 'Title',
    }
})

module.exports = mongoose.model('Card',cardSchema)