import express from "express";
import { createDirectory, deleteDirectory, getDirectories, updateDirectory } from "../controllers/directoryController.js";

const router = express.Router();

// router.param("parentDirId", validateIdMiddleware);
// router.param("id", validateIdMiddleware);


router.get("/{:id}", getDirectories);
router.post("/{:parentDirId}", createDirectory);
router.patch("/:id", updateDirectory);
router.delete("/:id", deleteDirectory);

export default router;
