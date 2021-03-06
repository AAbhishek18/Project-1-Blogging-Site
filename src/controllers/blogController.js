const jwt = require("jsonwebtoken")
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")

const moment = require('moment')

let time = moment().format('YYYY-MM-DDTHH:MM:ss.SSS')

const createBlog = async function (req, res) {

    try {
        let data = req.body
        if (Object.keys(data).length !== 0) {
            if (!data.title) return res.status(400).send({ status: false, msg: "blog title must needed" })
            if (!data.body) return res.status(400).send({ status: false, msg: "blog body needed" })
            if (!data.authorId) return res.status(400).send({ status: false, msg: "plz enter author Id" })
            let validAuthor = await authorModel.findById({ _id: data.authorId })
            if (validAuthor === null) return res.status(400).send({ status: false, msg: "Author Id not valid" })
            if (!data.category) return res.status(400).send({ status: false, msg: "plz enter category" })
            if (data.isPublished == true) data.publishedAt = time
            if (data.deletedAt == true) data.deletedAt = time
            let savedData = await blogModel.create(data)
            res.status(201).send({ status: true, msg: "Blog created successfull", data: savedData })
        }
        else res.status(400).send({ status: false, msg: "request body must needed" })

    }
    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }

}


const updateBlogs = async function (req, res) {
    try {
        let data = req.body
        var blogId = req.params.blogId
        let gotblog = await blogModel.find({ _id: blogId, isDeleted: false })
        if (gotblog.length==0) return res.status(404).send({status:false,msg:"Blog not exist"})
      
        if (data.isPublished === true) {
            var updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, {title: data.title, body: data.body,category:data.category, $push: { tags: data.tags, subcategory: data.subcategory }, $set: { publishedAt: time, isPublished: true } }, { new: true })
            return res.status(200).send({ status: true,msg:"update successful" ,data: updatedBlog })
        }
        if(data.isPublished===false) {
            req.body.publishedAt = " "
            detailsToUpdate = req.body
            var updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, {title: data.title, body: data.body,category:data.category, $push: { tags: data.tags, subcategory: data.subcategory }, $set: { publishedAt:"", isPublished: false } }, { new: true })
           return res.status(200).send({ status: true,msg:"update succesfull", data: updatedBlog })
        }
        var updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, { title: data.title, body: data.body,category:data.category, $push: { tags: data.tags, subcategory: data.subcategory } }, { new: true })
        res.send({status:true,msg:"update successfull", data: updatedBlog })
    }

    catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }
}

const deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        let allBlogs = await blogModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time } }, { new: true, upsert: true })
        if (allBlogs) res.status(200).send({ status: true,msg:"delete sucsessful", data: allBlogs })
        else res.status(404).send({ status: false, msg: "No Blogs Exist" })
    }
    catch (err) {
        res.status(400).send({ status: false, msg: err.message })
    }
}


const deleteBlogsByFields = async function (req, res) {
    try {
        let data = req.query
        data.isDeleted = false
        let any = await blogModel.find(data)
        if (Object.keys(any).length !== 0) {
            let all = await blogModel.updateMany(data, { $set: { isDeleted: true, deletedAt: time } }, { new: true, upsert: true })
            res.status(200).send({ status: true,msg:"delete sucsessfull", data: all })
        }
        else res.status(404).send({ status: false, msg: "No Blogs Exist" })
    } catch (err) {
        res.status(400).send({ status: false, msg: err.message })
    }
}



const getBlog = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data).length === 0) {
            let allBlogs = await blogModel.find({ isPublished: true, isDeleted: false })
            if (allBlogs.length == 0) return res.status(404).send({ status: false, msg: "not found" })
            return res.status(200).send({ status: true,msg:"get all blogs" ,data: allBlogs })
        }

        let filterBlogs = await blogModel.find({ $and: [data, { isPublished: true }, { isDeleted: false }] })

        if (filterBlogs.length === 0) return res.status(404).send({ status: false, msg: "data not found" })


        res.status(200).send({ status: true,msg:"get all blogs" ,data: filterBlogs })
    }
    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }


}


const loginAuthor = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if (!email) return res.status(400).send({ status: false, msg: "plz enter email" })
        if (!password) return res.status(400).send({ status: false, msg: "plz enter password" })
        let valid = await authorModel.findOne({ email: email, password: password })
        if (!valid) {
            return res.status(404).send({ status: false, msg: "email or password is wrong" })
        }
        let token = jwt.sign({
            authorId: valid._id.toString(),
            group: 25,
            batch: "uranium"
        }, "group-25")
        res.setHeader("x-api-key", token)
        res.status(200).send({ status: true,msg:"author login sucsessful", data: token })
    }
    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }
}




module.exports.loginAuthor = loginAuthor
module.exports.getBlog = getBlog
module.exports.createBlog = createBlog
module.exports.deleteBlogsByFields = deleteBlogsByFields
module.exports.updateBlogs = updateBlogs
module.exports.deleteBlogs = deleteBlogs

