import { Schema, model } from "mongoose";
import bcryptjs from 'bcryptjs'
import { errorMessages } from "../helpers/strings.js";

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

// This is executed before saving a user
userSchema.pre("save", async function (next) {
    const user = this;

    // Execute this code only if user wants to change the password
    if (!user.isModified("password")) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);
        next();
    } catch (error) {
        console.log(error);
        throw new Error(errorMessages.passwordHash);
    }
});

// Method used to compare input password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password)
}

export const User = model('User', userSchema)