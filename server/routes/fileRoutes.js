import express from "express";
import { deleteFile, getFile, updateFile, uploadFile } from "../controllers/fileController.js";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";

const router = express.Router();

router.param("parentDirId", validateIdMiddleware);
router.param("id", validateIdMiddleware);

router.post("/{:parentDirId}", uploadFile );

router.get("/:id", getFile );

router.patch("/:id", updateFile);

router.delete("/:id", deleteFile);

export default router;
