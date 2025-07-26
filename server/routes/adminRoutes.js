import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getAllUsers, logoutUserByAdmin } from "../controllers/userController.js";
import validateIdMiddleware from "../middlewares/validateIdMiddleware.js";

const router = Router();

router.param('id', validateIdMiddleware);

router.get("/", protect('admin', 'manager'), getAllUsers);
router.delete("/:id", protect('admin'), logoutUserByAdmin);

export default router;