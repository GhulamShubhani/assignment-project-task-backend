import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError";
import jwt from "jsonwebtoken";

// Define an interface for your document
interface UserInterface extends Document {
  userId: string;
  fullName: string;
  email: string;
  password: string;
  userType: "user" | "admin" ;
  avatar?: string;
  refreshToken?: string;
  isBlock?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

// Define the schema
const userSchema = new Schema<UserInterface>(
  {
    userId: {
      type: String,
      required: [true, "Please generate a user ID (admin side)"],
    },
    
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
      maxlength: 40,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 5,
    },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
    },
   
    refreshToken: {
      type: String,
    },
    isBlock:{
      type:Boolean,
      default:false
    },
    isDeleted:{
      type:Boolean,
      default:false
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre<UserInterface>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new ApiError(500, "Unknown error occurred during password hashing"));
    }
  }
});

// Method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (password: string) {  
  return await bcrypt.compare(password, this.password);
};



// Method to generate access token
userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      data: {
        _id: this._id,
        userId: this.userId,
       
        fullName: this.fullName,
        email: this.email,
        userType: this.userType,
      },
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    // { expiresIn: '10m', }
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET ?? "defaultSecret";
    const expiry = process.env.REFRESH_TOKEN_EXPIRY ?? "15d";

   return jwt.sign(
      { data: { _id: this._id } },
      secret,
      { expiresIn: expiry }
    );
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new ApiError(500, "Token not generated");
  }
};






// Create and export the model
const User = model<UserInterface>("User", userSchema);

export default User;
