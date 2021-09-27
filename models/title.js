const mongoose =require('mongoose')
const Schema=mongoose.Schema;
const Card=require('./cards')

const profileSchema = new Schema({
    filename: String,
    url: String
})

profileSchema.virtual('profile').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_40,w_40,r_max')
})

const titleSchema =new Schema({
    title:{
        type:String,
        required:true,
    },
    creator:{
        type: String,
        required: true
    },
    creatorProfile:profileSchema,
    totalLikes:{
        type: Number,
        default: 0
    }
})


module.exports = mongoose.model('Title', titleSchema)