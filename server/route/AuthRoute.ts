import Express  from "express";
import { loginUser, logoutUser, regiterUser, VerifyUser } from "../controllers/AuthController.js";
import protect from "../middlwares/auth.js";
const AuthRouter = Express.Router();

AuthRouter.post('/register',regiterUser)
AuthRouter.post('/login',loginUser)
AuthRouter.get('/verify',protect, VerifyUser)
AuthRouter.post('/logout',protect,logoutUser)


export default AuthRouter
