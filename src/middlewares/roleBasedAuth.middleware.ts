import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";


export const RoleBasedAuth = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

      if (!req.user || !req.user.userType) {
        return next(new ApiError(401, "Unauthorized: User not logged in."));
      }
  
      if (!roles.length || !roles.includes(req.user.userType)) {
        return next(new ApiError(403, "Forbidden: You do not have permission to access this resource."));
      }
  
      next();
    };
  };
