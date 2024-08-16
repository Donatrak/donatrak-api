import {Router} from "express"
import { confirmOtp, requestPasswordReset, resetPassword } from "../controllers/passwordReset.js";


export const passwordResetRouter =  Router();

// define routes
passwordResetRouter.post('/users/auth/request-password-reset', requestPasswordReset);
passwordResetRouter.post('/users/auth/confirm-otp', confirmOtp);
passwordResetRouter.post('/users/auth/reset-password', resetPassword);