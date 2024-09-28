import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";
import CloudinaryUploadFunction from "../utils/Cloudinary";
import ApiResponse from "../utils/ApiResponse";
import jwt from 'jsonwebtoken'


const options = {
  httpOnly:false,
  // secure:true,
}

interface MulterRequest extends Request {
  files?:
    | {
        [fieldname: string]: Express.Multer.File[]; 
      }
    | Express.Multer.File[];
}

const genrateAccessAndRefreshToken = async (_id: string) => {
  try {
    const user:any = await User.findById({ _id });
    // console.log(user,"user");
    if(user.isDeleted==true) throw new ApiError(400, "user may be deleted");
    
    const accessToken = await user?.generateAccessToken();
    
    const refreshToken = await user?.generateRefreshToken();
    if (refreshToken && user) {      
      user.refreshToken = refreshToken;
      user.save({ validateBeforeSave: false });
    }
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "token not genrated");
  }
};

const userRegisterFunction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const multerReq = req as MulterRequest;
      const {  fullName, email, password, userType } = req.body;

      // Validate required fields
      if ( !fullName || !email || !password) {
        throw new ApiError(400, "All fields are required.");
      }

      // Generate unique user ID
      const userId: string = `user${fullName.split(" ")[0]}${Math.ceil(Math.random() * 100)}${Date.now()}`;

      // Check if the user already exists
      const existUser = await User.findOne({
        $or: [ { email }, { userId }],
      });
      if (existUser) throw new ApiError(400, "User already exists.");

      // Get avatar local path
      const avatarLocalPath = (
        multerReq.files as { avatar?: Express.Multer.File[] }
      ).avatar?.[0]?.path;

      const avatarUrl = await CloudinaryUploadFunction(avatarLocalPath);
      // Create new user
      const newUser = await User.create({
        userId,
     
        fullName,
        email,
        userType: userType || "user",
        avatar: avatarUrl,
        password,
      });

      if (!newUser) throw new ApiError(400, "User not created.");

      // Fetch the user data excluding sensitive information
      const userData = await User.findById(newUser._id).select(
        "-password -RefreshToken"
      );

      // Send success response
      return res
        .status(201)
        .json(new ApiResponse(201, userData, "User registered successfully"));
    } catch (error) {
      next(error);
    }
  }
);

const userLoginFuntion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, email, password } = req.body;
      // console.log(userId,  email, password);
      
      if (!(userId  || email)) {
        throw new ApiError(400, "field is missing");
      }
      if (!password) {
        throw new ApiError(400, "password");
      }
      const isValidUser: any = await User.findOne({
        $or: [{ userId },  { email }],
      });
      if (!isValidUser) throw new ApiError(404, "invalid user");

      const checkpassword = await isValidUser.isPasswordCorrect(String(password));
      if (!checkpassword) throw new ApiError(400, "invalid password");

      const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
        isValidUser?._id
      );

      let loginUser:any = await User.findById({_id:isValidUser?._id}).select('-password -refreshToken')
      loginUser = loginUser.toObject();
      loginUser.accessToken = accessToken
      res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,loginUser,"login Successfully"))
    } catch (error) {
      console.log(error, "--error--");
      next(error);
    }
  }
);
const userlogoutFuntion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const updateuser = await User.findByIdAndUpdate(
      req.user!._id,{
        $set:{
          refreshToken:undefined
        }
      },{
        new:true
      }
    )

    if(!updateuser){
      throw new ApiError(400,"something went wrong")
    }
    
    res.status(200).clearCookie('accessToken',options).clearCookie('refreshToken',options).json(new ApiResponse(200,"logout Successfully"))

  }
);
const userShowProfileFuntion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("test",req.user);
    
   const userProfileData = await User.findById(req.user!._id).select('-password -refreshToken')
   if(!userProfileData) throw new ApiError(400,'try again')
    res.status(200).json(new ApiResponse(200,userProfileData,"login Successfully"))
  }
);
const userUpdateProfileFunction = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
    const { fullName  } = req.body;
    if( !( fullName  )) throw new ApiError(400,"fields is missing")

    const updatedData = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          fullName:fullName && fullName ,
        }
      },{new:true}
    ).select('-password -refreshToken')
    
    res.status(200).json(new ApiResponse(200,updatedData,"login Successfully"))

})


const userUpdateAvatarFunction = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
  const avatarPath =req.file &&  req.file!.path
  const avatarUrl =await CloudinaryUploadFunction(avatarPath)
  if (!avatarUrl) throw new ApiError(400, "fields is missing");

    const updatedData = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatarUrl,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(new ApiResponse(200, updatedData, "login Successfully"));

})

const userUpdatePasswordFunction = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
    const { oldPassword , newPassword } = req.body;
    if( !( oldPassword && newPassword )) throw new ApiError(400,"fields is missing")
    
    const userData = await User.findById(req.user!._id)
    if(!userData) throw new ApiError(404,"user is not found")

    const checkPassword = await userData.isPasswordCorrect(oldPassword)
    if(!checkPassword) throw new ApiError(404,"Password not match")

    userData.password=newPassword
    userData.save({validateBeforeSave:false})
    
    res.status(200).json(new ApiResponse(200,req.user,"login Successfully"))

})
const userDeleteFunction = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
    const userData = await User.findById(req.user!._id)
    if(!userData) throw new ApiError(404,"user is not found")
    userData.isDeleted=true
    userData.save({validateBeforeSave:false})
    res.status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json(new ApiResponse(200,"user Deleted Successfully"))

})
const userRefreshTokenFunction = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken) throw new ApiError(404,"refreshToken is not present")
    
  const tokenData:any = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET as string)
  console.log(tokenData,"tokenData");
  console.log(tokenData.data,"tokenData----");

  const userData:any = await User.findById(tokenData?.data!._id)
  if(!userData) throw new ApiError(404,"invalid token")
  if(incomingRefreshToken !== userData?.refreshToken )throw new ApiError(404,"invalid token")
  const {} = await genrateAccessAndRefreshToken(userData._id)
  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    userData?._id
  );

  let loginUser:any = await User.findById({_id:userData?._id}).select('-password -refreshToken')
  
  loginUser.accessToken = accessToken
  res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,loginUser,"login again Successfully"))
  
    

})




const allUserDataFuntion = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
   const userData = await User.find().select('-password -refreshToken')
   if(!userData) throw new ApiError(400,'try again')

    res.status(200).json(new ApiResponse(200,userData,"login Successfully"))

  }
);


export { 
  userRegisterFunction, 
  userLoginFuntion, 
  userlogoutFuntion,
  userShowProfileFuntion,
  allUserDataFuntion,
  userUpdateProfileFunction,
  userUpdatePasswordFunction,
  userDeleteFunction,
  userUpdateAvatarFunction,
  userRefreshTokenFunction,
};
