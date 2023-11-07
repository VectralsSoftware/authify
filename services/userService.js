import { User } from "../models/User.js"

const findByEmail = async (email) => {
    const user = await User.findOne({ email })
    return user || null
}

const findById = async (id) => {
    const user = await User.findById(id, '-password').lean()
    return user || null
}

export const UserService = {
    findByEmail,
    findById
}