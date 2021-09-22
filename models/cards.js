const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const title =require('./title');
const liked =require('./likes');
const { date } = require('joi');

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
       type: String,
       required: true,
    },
    likes:[
        {
            type: String,
            required: true
        }
    ],
})

cardSchema.set('timestamps', true);

cardSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await liked.deleteMany({ card: { $in: doc._id } })
        console.log(doc);
        console.log(liked);
        // console.log(liked._id);
    }
})

module.exports = mongoose.model('Card',cardSchema)