import { model, Schema } from "mongoose";

const directory = new Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.ObjectId,
        required: true
    },
    parentDirId: {
        type: Schema.ObjectId        
    }
});

export default model('Directory', directory);

