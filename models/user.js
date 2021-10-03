const mongoose =require('mongoose')
const Schema=mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose')


const profileSchema = new Schema({
    filename: String,
    url: String
})
profileSchema.virtual('thumbnail').get(function () {
    // return this.url.replace('/upload', '/upload/w_350,h_400,c_fill')
    // return this.url.replace('/upload', '/upload/c_fill,g_face,h_750,w_700')
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_350,w_350,r_max')
})
profileSchema.virtual('profile').get(function () {
    return this.url.replace('/upload', '/upload/c_fill,g_face,h_90,w_90,r_max')
})

const userSchema =new Schema({
    email:{
        type: String,
        required:true,
        unique: true
    },
    name:{
        type: String,
        required:true,
        trim: true
    },
    username:{
        type: String,
        required:true,
        trim: true
    },
    profile:profileSchema
})

userSchema.set('timestamps', true);

userSchema.plugin(passportLocalMongoose,)

module.exports = mongoose.model('User', userSchema)