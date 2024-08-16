import mongoose from "mongoose";
import "dotenv/config"

const MongoUrl = process.env.MONGO_URL;

// connection link
export const dbConnection = async() =>{
     await mongoose.connect(MongoUrl)
         console.log('Database connected')
   } 