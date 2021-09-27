const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    filename: String,
    url: String
})
imageSchema.virtual('profile').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_40,w_40,r_max')
})

const commentSchema = new Schema({
    comment: {
        type: String,
    },
    user: {
        type:String
    },
    title:{
        type: Schema.Types.ObjectId,
        ref:'Title'
    },
    card:{
        type:Schema.Types.ObjectId,
        ref:'Card'
    },
    creatorProfile:imageSchema,
    likes:[
        {
            type:String      
        }
    ]
})

module.exports = mongoose.model('Comment', commentSchema)