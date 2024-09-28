import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import Task from "../models/task.model";




const getAllTask = asyncHandler(async (req:Request,res:Response)=>{
    try {
       const getAllTaskList = await Task.find({isDeleted:false,userId:req.user?.userId})
       if(!getAllTaskList) throw new ApiError(400,"somwthinf went wrong")
    
        return res
            .status(200)
            .json(new ApiResponse(200, getAllTaskList, "All Task fetch successfully !"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const getAllProjectTask = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Parse page and limit from query params or set default values
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      // Find all tasks for a given project with pagination
      const tasks = await Task.aggregate([
        {
          $match: {
            isDeleted: false,
            userId: req.user?.userId,
            projectId: req.params.id,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            "__v": 0,
            "createdAt": 0,
            "updatedAt": 0,
            "isDeleted": 0,
            'userDetails.password': 0,
            'userDetails.refreshToken': 0,
            'userDetails.createdAt': 0,
            'userDetails.updatedAt': 0,
            'userDetails.__v': 0,
            'userDetails.isDeleted': 0,
          },
        },
        {
          $skip: skip, // Skip the first n documents
        },
        {
          $limit: limit, // Limit the number of documents returned
        },
      ]);
  
      if (!tasks.length) throw new ApiError(400, 'No tasks found.');
  
      const totalTasks = await Task.countDocuments({
        isDeleted: false,
        userId: req.user?.userId,
        projectId: req.params.id,
      });
  
      return res.status(200).json(
        new ApiResponse(200, {
          tasks,
          totalTasks,
          totalPages: Math.ceil(totalTasks / limit),
          currentPage: page,
          pageSize: limit,
        }, 'Tasks fetched successfully!')
      );
    } catch (error: any) {
      console.log(error?.message);
      throw new ApiError(500, error?.message);
    }
  });
  
const getTask = asyncHandler(async (req:Request,res:Response)=>{
    console.log(req.params.id,"req.params.taskid");

    try {
        if(!req.params.id) throw new ApiError(400,"Task id not found");
       const getTask = await Task.find({isDeleted:false,userId:req.user?.userId,taskId:req.params.id})
       if(!getTask) throw new ApiError(400,"somwthinf went wrong")
    
        return res
            .status(200)
            .json(new ApiResponse(200, getTask, "Task fetch successfully !"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const createTask = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const {priority,status,projectId,taskName} = req.body;
        if(!(status && priority && projectId && taskName)) throw new ApiError(400,"field is missing");
        const isTaskExist = await Task.findOne({taskName})
        if(isTaskExist) throw new ApiError(400,"Task already exist");
    
        const task_id = `task${taskName.split(" ")[0]}${Math.ceil(Math.random() * 100)}${Date.now()}`
    
        const newTaskInstance = await Task.create({
            taskId:task_id,
            taskName,
            status,
            priority,
            userId:req.user?.userId,
            projectId
        })
        if(!newTaskInstance) throw new ApiError(500,"Task not create");
    
        return res
            .status(201)
            .json(new ApiResponse(201, newTaskInstance, "Task registered successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const updateTask = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const taskId = req.params.id;
        const {priority,status,projectId,taskName} = req.body;
        if(!(priority||status||projectId||taskName)) throw new ApiError(400,"field is missing");
        const isTaskExist = await Task.findOne({taskId})
        if(!isTaskExist) throw new ApiError(400,"Task not exist");

        const updatedfields:any = {};
        if(priority) updatedfields.priority=priority;
        if(status) updatedfields.status=status;
        if(taskName) updatedfields.taskName=taskName;
    
    
        const newTaskInstance = await Task.findOneAndUpdate(
            {taskId,projectId},
            {$set:updatedfields},
            {new:true}
        )
        if(!newTaskInstance) throw new ApiError(500,"Task not create");
    
        return res
            .status(200)
            .json(new ApiResponse(200, newTaskInstance, "Task updated successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})


const removeTask = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const taskId = req.params.id;
        if(!taskId) throw new ApiError(400,"field is missing");
        const isTaskExist = await Task.findOne({taskId})
        if(!isTaskExist) throw new ApiError(400,"Task is not exist");

        const newTaskInstance = await Task.findOneAndUpdate(
            {taskId},
            {$set:{isDeleted:true}},
            {new:true}
        )
        if(!newTaskInstance) throw new ApiError(500,"Task not removed");
    
        return res
            .status(200)
            .json(new ApiResponse(200, newTaskInstance, "Task removed successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const deleteTask = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const taskId = req.params.id;
        if(!taskId) throw new ApiError(400,"field is missing");
        const isTaskExist = await Task.findOne({taskId})
        if(!isTaskExist) throw new ApiError(400,"Task not exist");

       const deleteTaskInstance = await Task.findOneAndDelete({taskId,projectId:isTaskExist.projectId})
        if(!deleteTaskInstance) throw new ApiError(500,"Task not deleted");
    
        return res
            .status(200)
            .json(new ApiResponse(200, "Task deleted successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})


export {
    getAllTask,
    getAllProjectTask,
    getTask,
    createTask,
    updateTask,
    removeTask,
    deleteTask,
}


