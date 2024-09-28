import env from "dotenv";
env.config();
import connection from "./db/database";
import app from "./app"

connection().then(()=>{
    console.log("test");

    app.listen(process.env.PORT,()=>{
        console.log(`Data Base connect on Port ${process.env.PORT}`);
        
    })
    
}).catch((error)=>{
    console.error(error);
    
})

