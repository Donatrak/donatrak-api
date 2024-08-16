import {Router} from "express";
import { loginSession, loginToken, logout, register, getUsers, createUser, updateUser } from "../controllers/user_controller.js";
import { checkAuth } from "../middlewares/auth.js";


export const userRouter = Router();


userRouter.post('/users/auth/register', register);
userRouter.post('/users/auth/token/login', loginToken);
userRouter.post('/users/auth/session/login', loginSession);
userRouter.post('/users/auth/logout', checkAuth, logout);
userRouter.patch('/users/auth/:id', checkAuth, updateUser);

