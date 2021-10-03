const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const title =require('./title');
const liked =require('./likes');
const Comment = require('./comment')
const { date } = require('joi');

const imageSchema = new Schema({
    filename: String,
    url: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_1150,w_1000')
})
imageSchema.virtual('profile').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_90,w_90,r_max')
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
       type: String,
       required: true,
    },
    creatorProfile:imageSchema,
    likes:[
        {
            type: String,
            required: true
        }
    ],
    numOfLikes:{
        type:Number,
        default: 0
    },
    numOfComment:{
        type:Number,
        default:0
    }
})

cardSchema.set('timestamps', true);

cardSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await liked.deleteMany({ card: { $in: doc._id } })
        await Comment.deleteMany({card:{ $in: doc._id}})
        console.log(doc);
        console.log(liked);
    }
})

module.exports = mongoose.model('Card',cardSchema)