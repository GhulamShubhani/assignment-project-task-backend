import express, { json, urlencoded }  from "express";
import cookieParser from "cookie-parser"
import cors  from "cors";
import path from "path"
 const app = express();

// console.log("0-0-0-0-",path.join(__dirname,"..", 'public'));


const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001','https://assignment-project-task-frontend.vercel.app']; // Add your frontend and other allowed origins

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(json({limit:"250kb"}))
app.use(urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"..", 'public')))
app.use(cookieParser())




import userRoute from "./routes/user.routes"
import projectRouter from "./routes/project.routes";
import taskRouter from "./routes/task.routes";

app.use('/api/v1/user',userRoute)
app.use('/api/v1/task',taskRouter)
app.use('/api/v1/project',projectRouter)



export default app
