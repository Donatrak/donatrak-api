import { Router } from "express";
import { remoteUpload } from "../middlewares/upload.js";
import { checkAuth } from "../middlewares/auth.js";
import { addUserProfile, updatePassword, updateUserProfile } from "../controllers/userProfile_controller.js";

export const userProfileRouter = Router();

userProfileRouter.post(
    '/users/userProfile',
    remoteUpload.single('profilePicture'), 
    checkAuth,
    addUserProfile
);

userProfileRouter.patch(
    '/users/userProfile/:id',
    remoteUpload.single('profilePicture'),
    checkAuth,
    updateUserProfile
);

userProfileRouter.patch('/users/passwordUpdate', checkAuth, updatePassword)
