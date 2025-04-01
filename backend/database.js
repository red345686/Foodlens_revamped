import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config(); 

const uri=process.env.DATABASE_URI; // Database uri
const client = new MongoClient(uri);


// Connect the database
export async function connectdb(){
    try{
        await client.connect()
        console.log("Connected to MongoDB")

        return client.db()
    }
    catch(error){
        console.log("Error connecting database" , error.message)
    }
}



