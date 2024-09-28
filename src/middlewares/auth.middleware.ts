import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError";

interface User{
    _id: string,
    userId: string,
    userName: string,
    fullName: string,
    email: string,
    userType: string
  }

  declare global{
    namespace Express{
        interface Request {
            user?:User
        }
    }
  }


export const authMiddleWare = asyncHandler(async(req:Request,res:Response,next:NextFunction)=>{
   const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ',"")
   jwt.verify(token,process.env.ACCESS_TOKEN_SECRET as string,(error:any,decoded:any)=>{
    if (error) {
        return res.status(403).json(new ApiError(400,"Invalid token" ));
      }
    req.user=decoded.data
   })
   next()
})  