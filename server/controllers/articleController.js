const { DATA_PATH, API} = require('config')
const {
    sendSuccess,
    failure,
    writeToDisk,
  collectRequestData,
  parseMultiPartDataIntoKeyValue,
} = require("../helpers/manipulateData");
const Article = require("../models/Article");
const multer = require("multer");
const { mongoose } = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const busboy = require("busboy");
const crypto = require("crypto");
const fs = require("fs");

//@desc:   get API description 
//@route: /api/articles/
async function getApi(req, res) {
  try {
    sendSuccess(res,API)  } catch (error) {
    console.log(error);
  }
}
//@desc:   get all articles
//@route: /api/articles/
async function getArticles(req, res) {
  try {
    const articles = await Article.find({}).lean();

    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(articles));
  } catch (error) {
    console.log(error);
  }
}

//@desc:   GET single article
//@route: /api/articles/:id
async function getSingleArticle(req, res, id) {
  try {
    const Intid = parseInt(id); //convertir l'id format string en Integer
    const articles = await Article.find().lean();
    const array = Object.values(articles); //convertir un JSON en array
    const article = array[Intid];
    // console.log(array[Intid]);
    if (!article) {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end(JSON.stringify({ message: "Article Not Found" }));
    } else {
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(JSON.stringify(article));
    }
  } catch (error) {
    console.log(error);
  }
}
//@desc:   POST an article
//@route: /api/articles/create/
async function createArticle(req, res) {
  try {
    
    collectRequestData(req, (data) => {
      // Extract data from the request
      const { title, author, body, filename, type, content } = parseMultiPartDataIntoKeyValue(data);
        console.log("content",content)
      // console.log("DATA:", data);
      // console.log("File", file);
        console.log("file name:", filename);
      console.log("mime type", type);
      // Create a new Article instance
      const newArticle = new Article({
        title,
        author,
        body,
          file:
          {
              content: content,
              id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
              fileName: filename,
              mimeType: type,
            }
           // Set to null if no file is provided
      }); // Save the article to the database
writeToDisk(title,content,type);
            newArticle.save();
      console.log("article:", newArticle);
        sendSuccess(res,newArticle)
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
//@desc:   UPDATE an article
//@route: /api/articles/update/
async function updateArticle(req, res, id) {
    console.log(id)
    // const IntID = parseInt(id)
    // console.log(IntID)
    collectRequestData(req, async (data) => {

        const { title, author, body, filename, type, content } = parseMultiPartDataIntoKeyValue(data)
        console.log(content)
        console.log(title)
        console.log(author)
        console.log(body)
        console.log(filename)
        console.log(type)
    
    
        var article = await Article.findById(id);
        article.file.content = content;
        article.title = title;
        article.author = author;
        article.body = body;
        article.file.fileName = filename;
        article.file.mimeType = type;
        
    article.save()
sendSuccess(res,article);
    console.log("article updated sendSuccessfully")}
)}

module.exports = { getApi, getArticles, getSingleArticle, createArticle, updateArticle };
