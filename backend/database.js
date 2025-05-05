import mongoose from 'mongoose';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config(); 

const uri = process.env.DATABASE_URI; // Database uri
const client = new MongoClient(uri);

// Connect to MongoDB with MongoClient (for backward compatibility)
export async function connectdb(){
    try{
        await client.connect();
        console.log("Connected to MongoDB with MongoClient");

        return client.db();
    }
    catch(error){
        console.log("Error connecting database with MongoClient" , error.message);
    }
}

// Connect to MongoDB with Mongoose
export async function connectMongoose() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB with Mongoose");
    } catch (error) {
        console.error("Error connecting to MongoDB with Mongoose:", error.message);
        throw error;
    }
}

// Initialize MongoDB connection
export async function initDatabase() {
    try {
        // Connect with both MongoClient (for backward compatibility) and Mongoose
        const db = await connectdb();
        await connectMongoose();
        return db;
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1); // Exit if database connection fails
    }
}



