const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { application } = require("express");
const router = require("./route/User.js")


const app = express();
dotenv.config();
app.use(express.json());

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to Mongo DB Atlas")
})

app.listen(PORT, () => {
    console.log(`Server started on PORT ${PORT}`);
});

app.use("", router);