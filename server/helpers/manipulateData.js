const { GOOGLE_USER_INFO_URL, DATA_PATH } = require("config");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const https = require("https");

function fetchUserData(accessToken, url, callback) {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  https.get(url, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      callback(data);
    });
  });
}
function sendToken(url, options, postData, callback) {
  const req = https.request(url, options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      callback(data);
    });
  });

  req.on("error", (error) => {
    console.error(`Error sending token request: ${error.message}`);
  });
  if (postData) {
    console.log("google code", postData);
    req.write(postData);
  }

  req.end();
}
function getAvatarUserFile(uniqueName, extension) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(
      __dirname,
      "../data/users/avatars",
      uniqueName + "." + extension
    );
    fs.readFile(filepath, (err, data) => {
      if (err) {
        console.log("there was an error trying to read the Avatar file", err);
        reject(err);
      } else {
        // console.log("loading file", data);
        const base64String = convertBufferToBase64String(data);
        // console.log("encoded data", base64String);
        resolve(data);
      }
    });
  });
}
function redirect(req, res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}



function redirectToIndex(req, res) {
  req.url = "index.html";
  const filePath = path.join(__dirname, "../../client/build", req.url);
  logger.info(`build path: ${filePath}`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      failure(res, `failed to read static files from build dir due to ${err}`);
    } else {
      res.writeHead(201);
      res.end(data);
    }
  });
}
function setContentType(filepath) {
  const fileExtension = path.extname(filepath).toLowerCase();
  const contentType =
    {
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".js": "application/javascript",
      ".json": "application/json",
      // Add more MIME types as needed
    }[fileExtension] || "application/octet-stream";
  return contentType;
}
function serveStaticBuild(req, res) {
  const filePath = path.join(__dirname, "../build", req.url);
  accessFiles(res, filePath);
  return;
}
function accessFiles(res, path) {
  fs.access(path, fs.constants.R_OK, (err) => {
    if (err) {
      failure(res, `there was an error:${err}`);
    } else {
      const contentType = setContentType(path);
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(path).pipe(res);
    }
  });
}

function serveAssets(req, res) {
  const filePath = path.join(__dirname, "../build", req.url);
  accessFiles(res, filePath);
  return;
}

function sendSuccess(res, data) {
  response(res, data, 201);
}

function response(res, data, status_code) {
  res.writeHead(status_code, { "Content-Type": "application/json" });

  res.end(JSON.stringify(data));
}
function notFound(res, data) {
  response(res, data, 404);
}
function failure(res, data) {
  response(res, data, 500);
}

const isByteArray = (data) => {
  return (
    Buffer.isBuffer(data) ||
    (Array.isArray(data) && data.every((item) => typeof item === "number"))
  );
};

const isByteString = (data) => {
  return typeof data === "string" && /^[0-9a-fA-F]+$/g.test(data);
};

const isBase64String = (data) => {
  try {
    return Buffer.from(data, "base64").toString("base64") === data;
  } catch (error) {
    return false;
  }
};

function convertBufferToBase64String(buffer) {
  const binaryData = Buffer.from(buffer, "base64");
  return binaryData.toString("base64");
}

function convertBinaryStringToBytesArray(binaryString) {
  const bytesArray = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytesArray[i] = binaryString.charCodeAt(i);
  }
  return bytesArray;
}
function checkContentAndConvert(content) {
  if (isBase64String(content)) {
    console.log("content is being parsed as base64 encoded string");
    const binaryString = atob(content);
    return convertBinaryStringToBytesArray(binaryString);
  } else if (isByteArray(content)) {
    console.log("content is being parsed as an array of bytes");
    return content;
  } else {
    try {
      console.log("content is being parsed as a binary string");
      return convertBinaryStringToBytesArray(content);
    } catch (error) {
      console.log(
        "Content Data is of unknown type and cannot be converted to bytes array",
        error
      );
    }
  }
}
function writeToDisk(title, content, type, targetDir) {
  //the data we get from client is base64 encoded string we need to decode to get a binary string and then to create a byte buffer from that string
  const bytesArray = checkContentAndConvert(content);

  let filepath = `${DATA_PATH}/${targetDir}/${title}.${type.split("/")[1]}`;
  console.log("Path:", filepath);
  let dirPath = path.dirname(filepath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.open(filepath, "w+", (err, fd) => {
    if (err) {
      console.log("Error opening the file:", err);
      return;
    }

    fs.write(fd, bytesArray, (fd, writeErr) => {
      if (writeErr) {
        console.log("cannot write to the file due to:", writeErr);
      }
    });
    fs.close(fd, (closeErr) => {
      if (closeErr) {
        console.log("Error while trying to close the file:", closeErr);
        return;
      }
    });
    console.log("the file has been written and closed successfully");
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

function hashData(data, alogrithm = "sha256") {
  const hash = crypto.createHash(alogrithm);
  hash.update(data);
  const hashedData = hash.digest("hex");
  return hashedData;
}

module.exports = {
  fetchUserData,
  sendToken,
  getAvatarUserFile,
  serveAssets,
  serveStaticBuild,
  redirectToIndex,
  response,
  notFound,
  hashData,
  sendSuccess,
  failure,
  collectRequestData,
  parseMultiPartDataIntoKeyValue,
  writeToDisk,
  redirect,
};
