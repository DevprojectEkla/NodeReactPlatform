const { DATA_PATH, } = require('config')
const crypto = require('crypto')
const fs = require('fs')


function sendSuccess(res,data)
{
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));

}
function failure(res,data)
{
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(data);

}

function writeToDisk(title,content,type) {

    let path = `${DATA_PATH}/image-${title}.${type.split('/')[1]}`;
        console.log("Path:",path)

      fs.open(path, "w+", (err, fd) => {
        if (err) {
          console.log("Error opening the file:", err);
          return;
        }

        fs.write(fd, content, (fd, writeErr) => {if (writeErr){
          console.log("cannot write to the file due to:", writeErr)};
        });
        fs.close(fd, (closeErr) => { if(closeErr){
          console.log("Error while trying to close the file:", closeErr); return;}
        });
        console.log("the file has been written and closed sendSuccessfully");
      });

    
}

function parseMultiPartDataIntoKeyValue(data) {
  // Extract the Content-Type header
  // Use a regular expression to find the boundary pattern
  const boundaryMatch = data.match(/--([\s\S]+?)\r\n/);

  if (!boundaryMatch || !boundaryMatch[1]) {
    // Handle the case where the boundary pattern is not found
    throw new Error("Unable to extract boundary pattern");
  }

  // Extract the boundary
  const boundary = boundaryMatch[1];

  // Split the data into parts using the dynamically extracted boundary
  const parts = data.split(`--${boundary}`);

  // Filter out empty parts
  const nonEmptyParts = parts.filter((part) => part.trim() !== "");

  const formData = {};

  nonEmptyParts.forEach((part) => {
    // Split each part into headers and content
    const [headers, content] = part.split("\r\n\r\n", 2);

    // Extract the name and value from the headers
    const nameMatch = headers.match(/name="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : null;

    if (name) {
      // Store the content in the formData object

        formData[name] = content.trim();
      }
  }); 
  
  return formData;
}
function collectRequestData(req, callback) {
  let body = "";

  req.on("data", (chunk) => {
    // console.log(chunk);
    body += chunk.toString();
    // console.log(body);
  });

  req.on("end", () => {
    callback(body);
  });
}

function hashData(data,alogrithm="sha256"){
    const hash = crypto.createHash(alogrithm)
    hash.update(data);
    const hashedData = hash.digest('hex')
    return hashedData

}

module.exports = {hashData, sendSuccess,failure,collectRequestData,parseMultiPartDataIntoKeyValue, writeToDisk} 
