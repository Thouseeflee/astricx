const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const title =require('./title')

const imageSchema = new Schema({
    filename: String,
    url: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100')
})

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
    },
    image:imageSchema,
    creator:{ 
       type: Schema.Types.ObjectId,
       ref: 'User'
    },
    likes:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Like'
        }
    ]
})

module.exports = mongoose.model('Card',cardSchema)