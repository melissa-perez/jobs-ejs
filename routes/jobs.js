const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const jobsController = require("../controllers/jobs");

router.get("/", authMiddleware, jobsController.getAllJobs);
router.get("/new", authMiddleware, jobsController.getNewJobForm);
router.post("/", authMiddleware, jobsController.createJob);
router.get("/edit/:id", authMiddleware, jobsController.getEditJobForm);
router.post("/update/:id", authMiddleware, jobsController.updateJob);
router.post("/delete/:id", authMiddleware, jobsController.deleteJob);


module.exports = router;