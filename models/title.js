const mongoose =require('mongoose')
const Schema=mongoose.Schema;
const Card=require('./cards')
const liked =require('./likes');
const Comment = require('./comment')

const profileSchema = new Schema({
    filename: String,
    url: String
})

profileSchema.virtual('profile').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_90,w_90,r_max')
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

titleSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Card.deleteMany({title: {$in: doc._id}})
        await liked.deleteMany({ title: { $in: doc._id } })
        await Comment.deleteMany({title:{ $in: doc._id}})
        console.log(doc);
        console.log(liked);
        console.log(Card);
    }
})

module.exports = mongoose.model('Title', titleSchema)