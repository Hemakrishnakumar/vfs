import { model, Schema } from "mongoose";


const user = new Schema({
   name: {
      type: String,
      required: true,
      minLength: 3
   },
   email: {
      type: String,
      required: [true, "Email address is mandatory"],
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email"],
   },
   password: {
      type: String,
      required: [true],
      minLength: 8
   },
   rootDirId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Directory'
   }
},
   {
      strict: 'throw',
      timestamps: true,
      // versionKey: false ; By default it would be '__v'.
      // collection : 'User' we can set the collection name as we want, it will override the name given in the model creation.
   }
);

export default model('User', user);
