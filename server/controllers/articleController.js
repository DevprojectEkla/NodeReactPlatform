const { DATA_PATH, API} = require('config')
const {
    hashData,
    sendSuccess,
    failure,
    writeToDisk,
  collectRequestData,
  parseMultiPartDataIntoKeyValue,
} = require("../helpers/manipulateData");
const Article = require("../models/Article");
const { mongoose } = require("mongoose");
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
      // console.log(articles)
      for (i = 0; i < articles.length;i++) {
          let article = articles[i];
          console.log("extract:",article)
          // console.log(article.file)
        let path = `${DATA_PATH}/${article.file.uniqueName}.${article.file.mimeType.split('/')[1]}`;
            content = fs.readFileSync(path)
          // console.log(content)
          article.file.content = content
      }

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
        const hashFileIdentifier = hashData(content)
      const newArticle = new Article({
        title,
        author,
        body,
          file:
          {
              content: "Data is stored on disk and is retrieved afterwards based on those metadata",
              id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
              uniqueName: hashFileIdentifier,
              fileName: filename,
              mimeType: type,
            }
           // Set to null if no file is provided
      }); // Save the article to the database
writeToDisk(hashFileIdentifier,content,type);
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
        // console.log(content)
        console.log(title)
        console.log(author)
        console.log(body)
        console.log(filename)
        console.log(type)
    const hashFileIdentifier = hashData(content);
        var article = await Article.findById(id);
        article.title = title;
        article.author = author;
        article.body = body;
        article.file.uniqueName = hashFileIdentifier;
        article.file.fileName = filename;
        

        article.file.mimeType = type;
        console.log(content)
        
   writeToDisk(hashFileIdentifier,content,type) 
    article.save()
sendSuccess(res,article);
    console.log("article updated sendSuccessfully")}
)}

module.exports = { getApi, getArticles, getSingleArticle, createArticle, updateArticle };
