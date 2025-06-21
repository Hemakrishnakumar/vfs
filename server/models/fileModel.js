import { model, Schema } from "mongoose";

const file = new Schema({
    name: {
        type: String,
        required: true
    },
    extension: String,
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    parentDirId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Directory'
    }
}, { timestamps: true, strict: 'throw' });

export default model('File', file);

