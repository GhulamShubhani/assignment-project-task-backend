

import { Router } from "express";
import { authMiddleWare } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/milter.middleware";
import { createProject, deleteProject, getAllProject, getProject, removeProject, updateProject } from "../controllers/project.controller";
import { RoleBasedAuth } from "../middlewares/roleBasedAuth.middleware";
const projectRouter = Router();

projectRouter.route('/').post(authMiddleWare,RoleBasedAuth('admin','user'), createProject)
projectRouter.route('/').get(authMiddleWare,RoleBasedAuth('admin','user'), getAllProject)
projectRouter.route('/:id').get(authMiddleWare,RoleBasedAuth('admin','user'), getProject)
projectRouter.route('/:id').put(authMiddleWare,RoleBasedAuth('admin','user'), updateProject)
projectRouter.route('/:id').delete(authMiddleWare,RoleBasedAuth('admin','user'), deleteProject)
projectRouter.route('/delete/:id').put(authMiddleWare,RoleBasedAuth('admin','user'), removeProject)

export default projectRouter;
