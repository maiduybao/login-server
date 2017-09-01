"use strict";

const express = require("express");
const router = express.Router();
const logger = require("log4js").getLogger("index");

/* GET home page. */
router.get("/", (req, res) => {
    logger.debug("This is in the index module");
    res.render("index", {title: "Express"});
});

module.exports = router;
