import mongoose, { Schema } from "mongoose";
import Catogary from "./task.model";


interface ProjectInterface extends Document{
    projectId:string;
    projectName:string;
    projectDescription:string;
    userId:string;
    isDeleted:boolean;
}

const ProjectSchema = new Schema<ProjectInterface>(
    {
        projectId:{
            type:String,
            required:[true,"project Id genrate "]
        },
        projectName:{
            type:String,
            required:[true,"project Name Required"]
        },
        projectDescription:{
            type:String,
            required:[true,"project Description1 Required "]
        },
        
        userId:{
            type:String,
            required:[true,"user id is required"]
        },
        
        isDeleted:{
            type:Boolean,
            default:false
        },
    },{
        timestamps:true
    }
)

const Project = mongoose.model<ProjectInterface>('Project',ProjectSchema);

export default Project;