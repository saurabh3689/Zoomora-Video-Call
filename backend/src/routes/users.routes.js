import{ Router } from "express";
import { addToHistory, getUserHistory, login, register, saveMeetingSummary } from "../controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/save_meeting_summary").post(saveMeetingSummary);

export default router;