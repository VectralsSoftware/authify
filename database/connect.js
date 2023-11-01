import mongoose from "mongoose";

try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB Connected 🟢') 
} catch (error) {
    console.log('MongoDB Connection Error: 🔴 \n', error);
    //If there was an error we should exit the process with failure:
    process.exit(1)
}