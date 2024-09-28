import mongoose from "mongoose";
import { DataBaseName } from "../constant";

const connection = async ():Promise<void> =>{
    try {
        const mongooseURI = process.env.MONGOOSE_URI as string
        const uriWithDatabase = `${mongooseURI}/${DataBaseName}`;
        if(!mongooseURI){
            throw new Error("Mongoose URL NOT comming")
        }
        const connect = await mongoose.connect(uriWithDatabase)
        // console.log(`connection`,connect.connections);
        
    } catch (error) {
        console.log(error,"ror");
        process.exit(1)
        
    }
}

export default connection;