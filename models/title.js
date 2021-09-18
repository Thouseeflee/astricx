const mongoose =require('mongoose')
const Schema=mongoose.Schema;
const Card=require('./cards')

const titleSchema =new Schema({
    title:{
        type:String,
        required:true,
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model('Title', titleSchema)