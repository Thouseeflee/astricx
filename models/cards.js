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
    }
})

module.exports = mongoose.model('Card',cardSchema)