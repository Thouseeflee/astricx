const mongoose =require('mongoose')
const Schema=mongoose.Schema;
const Card=require('./cards')

const titleSchema =new Schema({
    title:{
        type:String,
        required:true,
    },
    cards:[
        {
            type:Schema.Types.ObjectId,
            ref:'Card'
        }
    ]
})


module.exports = mongoose.model('Title', titleSchema)