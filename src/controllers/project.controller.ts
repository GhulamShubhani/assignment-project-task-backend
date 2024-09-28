import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import Project from "../models/project.model";



const getAllProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
       const getAllProjectList = await Project.find({isDeleted:false,userId:req.user?.userId})
       if(!getAllProjectList) throw new ApiError(400,"somwthinf went wrong")
    
        return res
            .status(201)
            .json(new ApiResponse(201, getAllProjectList, "All Project fetch successfully !"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const getProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
        if(!req.params.id) throw new ApiError(400,"Project id not found");
       const getProjectList = await Project.find({isDeleted:false,userId:req.user?.userId})
       if(!getProjectList) throw new ApiError(400,"somwthinf went wrong")
    
        return res
            .status(201)
            .json(new ApiResponse(201, getProjectList, "Project fetch successfully !"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const createProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const {projectName,projectDescription} = req.body;
        if(!(projectName && projectDescription)) throw new ApiError(400,"field is missing");
        const isProjectExist = await Project.findOne({projectName})
        if(isProjectExist) throw new ApiError(400,"Project already exist");
    
        const project_id = `project${projectName.split(" ")[0]}${Math.ceil(Math.random() * 100)}${Date.now()}`
    
        const newProjectInstance = await Project.create({
            projectId:project_id,
            projectName,
            projectDescription,
            userId:req.user?.userId
        })
        if(!newProjectInstance) throw new ApiError(500,"Project not create");
    
        return res
            .status(201)
            .json(new ApiResponse(201, newProjectInstance, "Project registered successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const updateProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const projectId = req.params.id;
        const {projectName,projectDescription} = req.body;
        if(!(projectName||projectDescription)) throw new ApiError(400,"field is missing");
        const isProjectExist = await Project.findOne({projectId})
        if(!isProjectExist) throw new ApiError(400,"Project not exist");

        const updatedfields:any = {};
        if(projectName) updatedfields.projectName=projectName;
        if(projectDescription) updatedfields.projectDescription=projectDescription;
    
    
        const newProjectInstance = await Project.findOneAndUpdate(
            {projectId},
            {$set:updatedfields},
            {new:true}
        )
        if(!newProjectInstance) throw new ApiError(500,"project not create");
    
        return res
            .status(201)
            .json(new ApiResponse(201, newProjectInstance, "project updated successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})


const removeProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const projectId = req.params.id;
        if(!projectId) throw new ApiError(400,"field is missing");
        const isProjectExist = await Project.findOne({projectId})
        if(!isProjectExist) throw new ApiError(400,"project is not exist");

        const newProjectInstance = await Project.findOneAndUpdate(
            {projectId},
            {$set:{isDeleted:true}},
            {new:true}
        )
        if(!newProjectInstance) throw new ApiError(500,"project not removed");
    
        return res
            .status(201)
            .json(new ApiResponse(201, newProjectInstance, "Project removed successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})
const deleteProject = asyncHandler(async (req:Request,res:Response)=>{
    try {
        const projectId = req.params.id;
        if(!projectId) throw new ApiError(400,"field is missing");
        const isProjectExist = await Project.findOne({projectId})
        if(!isProjectExist) throw new ApiError(400,"project not exist");

       const deleteProjectInstance = await Project.findOneAndDelete({projectId})
        if(!deleteProjectInstance) throw new ApiError(500,"project deleted");
    
        return res
            .status(200)
            .json(new ApiResponse(200, "Project deleted successfully"));
    } catch (error:any) {
        console.log(error?.message);
        throw new ApiError(500,error?.message);
    }
})


export {
    getAllProject,
    getProject,
    createProject,
    updateProject,
    removeProject,
    deleteProject,
}


