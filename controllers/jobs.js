const Job = require("../models/Job");
const parseVErr = require("../util/parseValidationErr");


/*const jobsShow = (req, res) =>{
    const csrfToken = req.signedCookies.csrfToken;
    console.log("CSRF Token sent to jobs form:", csrfToken);
    res.render("register", { _csrf: csrfToken });
}*/

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

const createJob = (req, res) => {
    res.send("create the job");
};

const getEditJobForm = (req, res) => {
    //res.render("job", { job: null });
};

const updateJob = async (req, res) => {
    res.send("edit job");
};

const deleteJob = async (req, res) => {
    res.send("delete job");
};

module.exports = {
    getAllJobs,
    getNewJobForm,
    createJob,
    getEditJobForm,
    updateJob,
    deleteJob
};