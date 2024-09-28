import { Router } from "express";
import { 
  allUserDataFuntion, 
  userLoginFuntion, 
  userlogoutFuntion, 
  userShowProfileFuntion, 
  userRegisterFunction,
  userUpdateProfileFunction,
  userUpdatePasswordFunction, 
  userDeleteFunction,
  userUpdateAvatarFunction,
  userRefreshTokenFunction,
} from "../controllers/user.controller";
import { upload } from "../middlewares/milter.middleware";
import { authMiddleWare } from "../middlewares/auth.middleware";
const router = Router();



// router.route("/").post(userRegisterFunction);
router.route("/").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    }
  ]),
  userRegisterFunction
);
router.route("/refreshToken").post( userRefreshTokenFunction );
router.route("/login").post( userLoginFuntion );
router.route("/logout").post( authMiddleWare , userlogoutFuntion );
router.route("/profile").get( authMiddleWare , userShowProfileFuntion );
router.route("/update-profile").put( authMiddleWare , userUpdateProfileFunction );
router.route("/update-avatar").put( authMiddleWare ,upload.single('avatar'), userUpdateAvatarFunction );
router.route("/update-password").put( authMiddleWare , userUpdatePasswordFunction );
router.route("/delete-profile").delete( authMiddleWare , userDeleteFunction );


export default router;
