import {Schema, model} from "mongoose";


const sessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24
    }
});

const Session = model('Session', sessionSchema);

export default Session;