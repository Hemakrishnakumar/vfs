import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from 'node:crypto';


const userSchema = new Schema({
   name: {
      type: String,
      required: true,
      minLength: 3
   },
   email: {
      type: String,
      required: [true, "Email address is mandatory"],
      unique: true, //it is not a validator, it creates the unique index on database level.
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
      // virtuals: {
      //    greet: {
      //       get() {
      //          return `Hi, ${this.name}`
      //       }
      //    }
      // },
      // versionKey: false ; By default it would be '__v'.
      // collection : 'User' we can set the collection name as we want, it will override the name given in the model creation.
      // methods: {
      //    async comparePassword(enteredPassword, password) {
      //       return await bcrypt.compare(enteredPassword, password)
      //    }
      // }
   }
);

//MIDDLEWARES
userSchema.pre('save', async function () {
   //Hashing the password only when password has been either created or modified.
   if (!this.isModified('password')) return;
   //this.password = crypto.createHash('sha256').update(this.password).digest('hex');
   
   // const salt = crypto.randomBytes(16);
   // const hashedPassword = crypto.pbkdf2Sync(this.password, salt, 100000, 32, 'sha256');
   // this.password = `${salt.toString('base64url')}.${hashedPassword.toString('base64url')}`;

   this.password = await bcrypt.hash(this.password, 12);
});


//METHODS
userSchema.methods.comparePassword = async (enteredPassword, password) => {
   //crypto.createHash('sha256').update(enteredPassword).digest('hex') === password  //plain hash. can be guessed using rainbow table.
   
   // const [salt, hashedPassword] = password.split('.');
   // const newHash = crypto.pbkdf2Sync(enteredPassword, Buffer.from(salt, 'base64url'), 100000, 32, 'sha256');
   // return hashedPassword === newHash.toString('base64url');
   
   return await bcrypt.compare(enteredPassword, password)
}


export default model('User', userSchema);
