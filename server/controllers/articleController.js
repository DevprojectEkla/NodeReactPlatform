const { ARTICLES_PATH, DATA_PATH } = require("../../config");

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

let articles;

//@desc:   get all articles
//@route: /api/articles/
async function getArticles(req, res) {
  try {
    articles = await Article.find({}).lean();
    // console.log(articles)
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(articles));
  } catch (error) {
    console.log(error);
  }
}

//@desc:   get image file for a single article by ID
//@route: /api/articleImage/:id
async function getImageFileForArticle(req, res, id) {
  try {
    const article = await Article.findById(id);
    // console.log(article.file)
    let path = `${DATA_PATH}/${ARTICLES_PATH}/${article.file.uniqueName}.${
      article.file.mimeType.split("/")[1]
    }`;
    content = fs.readFileSync(path);
    // console.log(content)
    const base64EncodedContent = content.toString("base64");
    article.file.content = base64EncodedContent;
    console.log("article:", article);
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify(article));
  } catch (error) {
    console.error(
      "Error trying to get the image path for this article:",
      error
    );
  }
}

//@desc:   GET single article
//@route: /api/articles/:id
async function getSingleArticle(req, res, id) {
  try {
    const article = await Article.findById(id);
    console.log("Single Article retrieved by id:", article._id);
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
    collectRequestData(req, async (data) => {
      // Extract data from the request
      const { title, author, body, filename, type, content } =
        parseMultiPartDataIntoKeyValue(data);
      console.log("content", content);
      // console.log("DATA:", data);
      // console.log("File", file);
      console.log("file name:", filename);
      console.log("mime type", type);
      // Create a new Article instance
      const hashFileIdentifier = hashData(content);
      const newArticle = new Article({
        title,
        author,
        body,
        file: {
          content:
            "Data is stored on disk and is retrieved afterwards based on those metadata",
          id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
          uniqueName: hashFileIdentifier,
          fileName: filename,
          mimeType: type,
        },
        // Set to null if no file is provided
      }); // Save the article to the database
      const targetDir = ARTICLES_PATH;
      writeToDisk(hashFileIdentifier, content, type, targetDir);
      try {
        await newArticle.save();
        console.log("article:", newArticle);
        sendSuccess(res, newArticle);
      } catch (error) {
        failure(res, `failed to create article due to:${error}`);
      }
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}
//@desc:   DELETE single article
//@route: /api/articles/delete/:id
async function deleteArticle(req, res, id) {
  try {
    console.log("Deleting Article:", id);
    Article.deleteOne(id);
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(JSON.stringify({ message: `Article ${id} Deleted Successfuly` }));
  } catch (error) {
    res.writeHead(500, { "Content-type": "application/json" });
    res.end(JSON.stringify({ message: `Server Error ${error}` }));
    console.log(error);
  }
}
//@desc:   UPDATE an article
//@route: /api/articles/update/
async function updateArticle(req, res, id) {
  console.log("Update triggered for id:", id);
  // const IntID = parseInt(id)
  // console.log(IntID)
  collectRequestData(req, async (data) => {
    const { title, author, body, filename, type, content } =
      parseMultiPartDataIntoKeyValue(data);
    // console.log(content)
    console.log(title);
    console.log(author);
    console.log(body);
    console.log(filename);
    console.log(type);
    const hashFileIdentifier = hashData(content);
    var article = await Article.findById(id);
    article.title = title;
    article.author = author;
    article.body = body;
    article.file.uniqueName = hashFileIdentifier;
    article.file.fileName = filename;

    article.file.mimeType = type;
    console.log(content);

    const targetDir = ARTICLES_PATH;
    writeToDisk(hashFileIdentifier, content, type, targetDir);
    article.save();
    sendSuccess(res, article);
    console.log("article updated sendSuccessfully");
  });
}

module.exports = {
  getArticles,
  deleteArticle,
  getImageFileForArticle,
  getSingleArticle,
  createArticle,
  updateArticle,
};
