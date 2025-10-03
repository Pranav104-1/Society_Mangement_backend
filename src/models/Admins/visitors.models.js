import {Schema,mongoose} from 'mongoose';

const VisitorSchema = new Schema({
    Date:{
        type:Date,
        required:true,
        default:Date.now
    },
    XlFile:{
        type:String,
        required:true
    }
})

export const VisitorFile=mongoose.model('Visitor',VisitorSchema,'visitors');

