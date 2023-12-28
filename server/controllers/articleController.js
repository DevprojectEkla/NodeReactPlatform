const { collectRequestData, parseDataIntoKeyValue } = require("../helpers/manipulateData");
const Article = require("../models/Article");
const multer = require("multer");
const { mongoose } = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;
const busboy = require("busboy");
const crypto = require("crypto");

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
    const Intid = parseInt(id);//convertir l'id format string en Integer
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
//@route: /api/articles/new/
async function createArticle(req, res) {
  try {
    // console.log('POST request');
    //   const bb = busboy({ headers: req.headers });
    //   bb.on('file', (name, file, info) => {
    //     const { filename, encoding, mimeType } = info;
    //     console.log(
    //       `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
    //       filename,
    //       encoding,
    //       mimeType
    //     );
    //       file.on('data', (data) => {
    //       console.log(`File [${name}] got ${data.length} bytes`);
    //     }).on('close', () => {
    //       console.log(`File [${name}] done`);
    //     });
    //   });
    //   bb.on('field', (name, val, info) => {
    //     console.log(`Field [${name}]: value: %j`, val);
    //   });
    //   bb.on('close', () => {
    //     console.log('Done parsing form!');
    //     res.writeHead(303, { Connection: 'close', Location: '/' });
    //     res.end();
    //   });
    //   req.pipe(bb);

    collectRequestData(req, (data) => {
      // Extract data from the request
      const { title, author, body, file } = parseDataIntoKeyValue(data);

      // console.log("DATA:", data);
      // console.log("File", file);
      // console.log("CONTENT", file.content.toString());
      // console.log("file name", file.fileName.name);
      // console.log("mime type", file.mimeType.type);
      // Create a new Article instance
      const newArticle = new Article({
        title,
        author,
        body,
        file: file
          ? {
              content: file.content,
              id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
              fileName: file.fileName.name,
              mimeType: file.mimeType.type,
            }
          : null, // Set to null if no file is provided
      }); // Save the article to the database
      newArticle.save();
      console.log("article:", newArticle);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newArticle));
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
}

module.exports = { getArticles, getSingleArticle, createArticle };
