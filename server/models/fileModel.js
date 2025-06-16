import { model, Schema } from "mongoose";

const file = new Schema({
    name: {
        type: String,
        required: true
    },
    extension: String,
    userId: {
        type: Schema.ObjectId,
        required: true
    },
    parentDirId: {
        type: Schema.ObjectId        
    }
},{timestamps: true});

export default model('File', file);

