import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware";
import { RoleBasedAuth } from "../middlewares/roleBasedAuth.middleware";
import { createTask, deleteTask, getAllProjectTask, getAllTask, getTask, removeTask, updateTask } from "../controllers/task.controller";

const taskRouter = Router();

taskRouter.route('/').get(authMiddleWare,RoleBasedAuth('admin',"user"),getAllTask)
taskRouter.route('/').post(authMiddleWare,RoleBasedAuth('admin',"user") ,createTask)
taskRouter.route('/:id').get(authMiddleWare,RoleBasedAuth('admin',"user"),getTask)
taskRouter.route('/:id').put(authMiddleWare,RoleBasedAuth('admin',"user"),updateTask)
taskRouter.route('/:id').delete(authMiddleWare,RoleBasedAuth('admin',"user"),deleteTask)
taskRouter.route('/delete/:id').put(authMiddleWare,RoleBasedAuth('admin',"user"),removeTask)
taskRouter.route('/project/:id').get(authMiddleWare,RoleBasedAuth('admin',"user"),getAllProjectTask)

export default taskRouter