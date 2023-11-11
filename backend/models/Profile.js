import { Schema, model } from "mongoose";

const profileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, // This way we connect a profile with a user based on the user id
        ref: 'User'
    },
    given_name: {
        type: String,
        required: true
    },
    family_name: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        default: false
    }
})


export const Profile = model('Profile', profileSchema)