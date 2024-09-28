import mongoose, { Schema } from "mongoose";


interface TaskInterface extends Document{
    taskId:string;
    taskName:string;
    status: 'To Do'| 'In Progress'| 'Done';
    priority: 'Low'| 'Medium'| 'High';
    userId:string;
    projectId:string;
    isDeleted:boolean;
}

const TaskSchema=new Schema<TaskInterface>(
    {
        taskId:{
            type:String,
            required:[true,"must genrate "]
        },
        taskName:{
            type:String,
            required:[true,"description  is required "]
        },
        status:{
            type:String,
            enum: ['To Do', 'In Progress', 'Done'],
             default: 'To Do',
            required:[true,"task status is required "]
        },
        priority:{
            type:String,
            enum: ['Low', 'Medium', 'High'],
             default: 'Medium',
            required:[true,"description  is required "]
        },
        userId:{
            type:String,
            required:[true,"user id is required"]
        },
        projectId:{
            type:String,
            required:[true,"project id is required"]
        },
        
        isDeleted:{
            type:Boolean,
            default:false
        },

    },{
        timestamps:true
    }
)


const Task = mongoose.model<TaskInterface>('Task',TaskSchema);
export default Task;