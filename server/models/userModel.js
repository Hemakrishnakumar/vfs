import { model, Schema } from "mongoose";


const user =  new Schema({
   name:{
    type: String,
    required: true
   },
   email: {
    type: String,
    required: [true, "Email address is mandatory"],    
   },
   password: {
    type: String,
    required: [true]
   },
   rootDirId : {
    type : Schema.ObjectId,
    required: true
   }
});

export default model('User', user);
