import { Schema, model } from "mongoose";
import bcryptjs from 'bcryptjs'
import { errorMessages } from "../helpers/strings.js";

const userSchema = new Schema({
    username: {
        type: String,
        trim: true, //Delete spaces in the beggining and end of the string,
        unique: true, //Prevent users from using an username twice,
        lowercase: true,
        index: { unique: true }
    },
    email: {
        type: String,
        trim: true, //Delete spaces in the beggining and end of the string,
        unique: true, //Prevent users from using an email twice,
        lowercase: true,
        index: { unique: true },
        // Make required only if user signs with email and password
        validate: {
            validator: function (value) {
                // Email is required only if providers array does not contain specific values
                return (!this.providers.includes('google') && !this.providers.includes('facebook') && !this.providers.includes('twitter')) ? !!value : true;
            },
            message: 'Email is required if providers array does not contain google, facebook, or twitter'
        }
    },
    password: {
        type: String
    },
    email_verified: {
        type: Boolean,
        default: false
    },
    providers: {
        type: [],
    }
})

// This is executed before saving a user
userSchema.pre("save", async function (next) {
    const user = this;

    // Execute this code only if user wants to change the password
    if (!user.isModified("password")) return next();

    try {
        // If user does not provide a password because its authenticating with oAuth providers
        if (!user.password) {
            next()
        } else {
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(user.password, salt);
            next();
        }
    } catch (error) {
        console.log(error);
        throw new Error(errorMessages.passwordHash);
    }
});

// Method used to compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {

    if (!this.password) {
        return false
    }

    return await bcryptjs.compare(candidatePassword, this.password)
}

export const User = model('User', userSchema)