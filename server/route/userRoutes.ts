import express from 'express';
import { getThumbnailbyId, getUsersThumbnails } from '../controllers/userController.js';
import protect from '../middlwares/auth.js';

const UserRouter = express.Router();

UserRouter.get('/thumbnails',protect,getUsersThumbnails)
UserRouter.get('/thumbnail/:id',protect,getThumbnailbyId)

export default UserRouter;