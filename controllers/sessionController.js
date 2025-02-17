const User = require("../models/User");
const parseVErr = require("../util/parseValidationErr");

const registerShow = (req, res) => {
    const csrfToken = req.signedCookies.csrfToken;
    console.log("CSRF Token sent to register form:", csrfToken);
    res.render("register", { _csrf: csrfToken });
};

const registerDo = async (req, res, next) => {
    if (req.body.password != req.body.password1) {
        req.flash("error", "The passwords entered do not match.");
        return res.render("register", { errors: req.flash("error") });
    }
    try {
        await User.create(req.body);
    } catch (e) {
        if (e.constructor.name === "ValidationError") {
            parseVErr(e, req);
        } else if (e.name === "MongoServerError" && e.code === 11000) {
            req.flash("error", "That email address is already registered.");
        } else {
            return next(e);
        }
        return res.render("register", { errors: req.flash("error") });
    }
    res.redirect("/");
};

const logoff = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.status(500).send("Error during logoff.");
        }
        console.log("Session destroyed, redirecting to home.");
        res.redirect("/");
    });
};


const logonShow = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    const csrfToken = req.signedCookies.csrfToken;
    console.log("CSRF Token sent to logon form:", csrfToken);
    res.render("logon", { _csrf: csrfToken });
};

module.exports = {
    registerShow,
    registerDo,
    logoff,
    logonShow,
};