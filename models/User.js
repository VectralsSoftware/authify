import { Schema, model } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true, //Delete spaces in the beggining and end of the string,
        unique: true, //Prevent users from using an email twice,
        lowercase: true,
        index: { unique: true }
    },
    password: {
        type: String,
        required: true
    },
})

export const User = model('User', userSchema)