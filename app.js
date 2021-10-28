const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const bcryptjs = require("bcryptjs");
const e = require("express");
const jwt = require("jsonwebtoken");



app.use(express.json())
app.use(cors({
    origin: "*"
}))

const URL = "mongodb+srv://sahaja:sahaja12@cluster0.8s2tb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

function authenticate(req, res, next) {
    // Check is the token is present in header
    if (req.headers.authorization) {
        // Check if the token is valid
        let valid = jwt.verify(req.headers.authorization, "}QF_w,(<u7BBt>V}");
        if (valid) {
            // if valid all next()
            req.userid = valid.id
            next();
        } else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }
    } else {
        res.status(401).json({
            message: "Unauthorized"
        })
    }

}

app.post("/user/register", async function (req, res) {
    try {
        // Open the Connection
        let connection = await mongoclient.connect(URL)

        // Select the DB
        let db = connection.db("shopify")

        let salt = await bcryptjs.genSalt(10)
        let hash = await bcryptjs.hash(req.body.password, salt);

        req.body.password = hash;

        // Select the collection
        // Do operation (Create,Read,update,Delete)
        await db.collection('user').insertOne(req.body)

        res.json({
            message: "User Created"
        })
    } catch (error) {
        console.log(error)
    }
})

app.post("/user/login", async function (req, res) {
    try {
        // Open the Connection
        let connection = await mongoclient.connect(URL)

        // Select the DB
        let db = connection.db("shopify")

        // Find the user doc with email id
        let user = await db.collection("user").findOne({ email: req.body.email });

        if (user) {
            // Encrypt the given password with user doc password
            let result = await bcryptjs.compare(req.body.password, user.password);
            // Compare both password
            // if both are same
            if (result) {
                // Generate JWT Token
                let token = jwt.sign({
                    id: user._id,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60)
                }, "}QF_w,(<u7BBt>V}")
                res
                    // .cookie("access_token", token, {
                    //     httpOnly: true
                    // })
                    .status(200)
                    .json({
                        message: "Success",
                        token
                    })
            } else {
                res.status(401).json({
                    message: "Username/Password is worng"
                })
            }
            // loggin the user
        } else {
            res.status(401).json({
                message: "Username/Password is worng"
            })
        }


    } catch (error) {
        console.log(error)
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log(`Server is running in PORT ${process.env.PORT || 3000}`)
})

