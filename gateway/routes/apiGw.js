const express = require("express");
const passport = require("passport");
require("../middlewares/passport");
const { forwardRequest } = require("../controllers/apiGw");

const router = express.Router();

// CORS middleware
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200); // Trả luôn preflight
    }

    next();
});

// Auth middleware
const checkAuth = (req, res, next) => {
    const parts = req.originalUrl.split("/");
    const isLogin = parts[2] === "IDENTITY" && parts[3] === "login";

    if (isLogin) return next();

    return passport.authenticate("jwt", { session: false })(req, res, next);
};

// Route
router.use(checkAuth, forwardRequest);

module.exports = router;