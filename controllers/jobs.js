const Job = require("../models/Job");
const parseVErr = require("../util/parseValidationErr");

const getAllJobs = async (req, res) => {
    try {
        const csrfToken = req.signedCookies.csrfToken;
        console.log("CSRF Token sent to jobs form:", csrfToken);
        const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt");
        res.render("jobs", { jobs, _csrf: csrfToken });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
};

const getNewJobForm = (req, res) => {
    res.render("job", { job: null });
};

const createJob = async (req, res) => {
    try {
        await Job.create({ ...req.body, createdBy: req.user._id });
        res.redirect("/jobs");
    } catch (error) {
        console.log(error);
        res.render("job", { errors: ["Failed to add job"] });
    }
};

const getEditJobForm = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || !job.createdBy.equals(req.user._id)) {
            return res.redirect("/jobs");
        }
        res.render("job", { job });
    } catch (error) {
        console.log(error);
        res.redirect("/jobs");
    }
};

const updateJob = async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job || !job.createdBy.equals(req.user._id)) {
        return res.redirect("/job");
    }
    try {
        await Job.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/jobs");
    } catch (error) {
        console.log(error);
        res.render("job", { errors: ["Failed to add job"] });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || !job.createdBy.equals(req.user._id)) {
            return res.redirect("/jobs");
        }
        await Job.findByIdAndDelete(req.params.id);
        res.redirect("/jobs");
    } catch (error) {
        console.log(error);
        res.redirect("/jobs");
    }
};

module.exports = {
    getAllJobs,
    getNewJobForm,
    createJob,
    getEditJobForm,
    updateJob,
    deleteJob
};