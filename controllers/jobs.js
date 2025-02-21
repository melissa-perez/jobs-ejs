const Job = require("../models/Job");
const parseVErr = require("../util/parseValidationErr");

const getAllJobs = async (req, res) => {
    try {
        const csrfToken = req.signedCookies.csrfToken;
        console.log("CSRF Token sent to jobs form:", csrfToken);
        const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt");
        res.render("jobs", { jobs, _csrf: csrfToken, messages: req.flash() });
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to fetch jobs.");
        res.redirect("/jobs");
    }
};

const getNewJobForm = (req, res) => {
    res.render("job", { job: null, messages: req.flash() });
};

const createJob = async (req, res) => {
    try {
        await Job.create({ ...req.body, createdBy: req.user._id });
        req.flash("success", "Job added successfully.");
        res.redirect("/jobs");
    } catch (error) {
        console.error(error);
        parseVErr(error, req);
        res.render("job", { job: null, messages: req.flash() });
    }
};

const getEditJobForm = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || !job.createdBy.equals(req.user._id)) {
            req.flash("error", "Unauthorized access.");
            return res.redirect("/jobs");
        }
        res.render("job", { job, messages: req.flash() });
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to load job for editing.");
        res.redirect("/jobs");
    }
};

const updateJob = async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job || !job.createdBy.equals(req.user._id)) {
        req.flash("error", "Unauthorized access.");
        return res.redirect("/jobs");
    }
    try {
        await Job.findByIdAndUpdate(req.params.id, req.body);
        req.flash("success", "Job updated successfully.");
        res.redirect("/jobs");
    } catch (error) {
        console.error(error);
        parseVErr(error, req);
        res.render("job", { messages: req.flash() });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || !job.createdBy.equals(req.user._id)) {
            req.flash("error", "Unauthorized access.");
            return res.redirect("/jobs");
        }
        await Job.findByIdAndDelete(req.params.id);
        req.flash("success", "Job deleted successfully.");
        res.redirect("/jobs");
    } catch (error) {
        console.error(error);
        req.flash("error", "Failed to delete job.");
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