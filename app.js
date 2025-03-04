const express = require("express");
require("express-async-errors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
    mongoURL = process.env.MONGO_URI_TEST;
}


const jobs = require("./routes/jobs");

const store = new MongoDBStore({
    // may throw an error, which won't be caught
    uri: mongoURL,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

// csrf-protection middleware
const csrf = require("host-csrf");
let csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1); // trust first proxy
    sessionParms.cookie.secure = true; // serve secure cookies
}

const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};

const csrf_middleware = csrf(csrf_options);
//app.use(csrf(csrf_options));


app.use(rateLimiter({
    windowsMs: 15 * 60 * 1000,
    max: 100
}));
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(session(sessionParms));


// For CSRF
app.use(cookieParser(process.env.SESSION_SECRET));

//app.use(csrf_middleware);

// For Passport
const passport = require("passport");
const passportInit = require("./passport/passportInit");
passportInit();
app.use(passport.initialize());
app.use(passport.session());

app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

app.use((req, res, next) => {
    if (req.path == "/multiply") {
        res.set("Content-Type", "application/json");
    } else {
        res.set("Content-Type", "text/html");
    }
    next();
});


app.get("/", csrf_middleware, (req, res) => {
    res.render("index");
});
app.use("/sessions", csrf_middleware, require("./routes/sessionRoutes"));

const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");

app.use("/secretWord", auth, csrf_middleware, secretWordRouter);
app.use("/jobs", csrf_middleware, auth, jobs);

app.get("/multiply", (req, res) => {
    const result = req.query.first * req.query.second;
    if (result.isNaN) {
        result = "NaN";
    } else if (result == null) {
        result = "null";
    }
    res.json({ result: result });
});


app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;
const start = () => {
    try {
        require("./db/connect")(mongoURL);
        return app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`),
        );
    } catch (error) {
        console.log(error);
    }
};

start();

module.exports = { app };
