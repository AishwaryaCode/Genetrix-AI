import  express  from "express";
import { deleteThumbnail, generateThumbnail } from "../controllers/ThumbnailController.js";
import Thumbnail from "../models/Thumbnail.js";
import protect from "../middlwares/auth.js";

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate',protect, generateThumbnail)
ThumbnailRouter.delete('/delete/:id',protect,deleteThumbnail)


export default ThumbnailRouter;
