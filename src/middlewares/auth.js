
const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");


const authEntication = async function (req, res, next) {
    try {
        let header = req.headers;
        let token = header["x-api-key"]
        if (!token) return res.status(400).send({ msg: "Sorry,Header(token) Must Needed" })

        jwt.verify(token, "group-25");
        next()
    }
    catch (error) {

        return res.status(407).send({status:false, msg: error.message })
    }


}



const authorIsation = async function (req, res, next) {
    try {
        let authorId;
        let header = req.headers;
        let token = header["x-api-key"]
        let decodedToken = jwt.verify(token, "group-25");
        let blogId = req.params.blogId;

        let data = req.query
        if (Object.keys(data).length === 0) {
            authorId = await blogModel.findOne({ _id: blogId }).select({ authorId: 1, _id: 0 })
        }
        else {
            authorId = await blogModel.findOne({$and:[data]}).select({ authorId: 1, _id: 0 })
        }
        let _id = authorId.authorId.toString()
        let logId = decodedToken.authorId;
        if (_id != logId) return res.status(401).send({status: false, msg: "Sorry,authorisation required  " });


        next()

    }


    catch (error) {
        return res.status(404).send({status : false, msg : error.message })
    }


}
module.exports.authEntication = authEntication
module.exports.authorIsation = authorIsation
