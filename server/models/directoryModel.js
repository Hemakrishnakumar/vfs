import { model, Schema } from "mongoose";

const directory = new Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    parentDirId: {
        type: Schema.ObjectId,
        ref: 'Directory'
    }
}, { strict: 'throw' });

export default model('Directory', directory);

