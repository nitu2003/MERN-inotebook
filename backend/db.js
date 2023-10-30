
const mongoose = require('mongoose')
var mongourl =""

mongoose.connect(mongourl,{
    useUnifiedTopology:true,
    useNewUrlParser: true
})

var db = mongoose.connection

db.on('connected' , ()=>{
    console.log('mongoDB connected :]')
})

db.on('error' ,()=>{ 
    console.log("mongoDB connection failed")
})

module.exports = mongoose
