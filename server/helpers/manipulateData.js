function parseDataIntoKeyValue(data) {
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
      if (name === "file") {
        const fileNameMatch = headers.match(/filename="([^"]+)"/);
        const fileName = fileNameMatch ? fileNameMatch[1] : null;
        console.log(fileNameMatch);
        console.log(fileName);
        const typeMatch = headers.match(/Content-Type: ([^\r\n]+)/);
        const mimeType = typeMatch ? typeMatch[1] : null;
        console.log("mimeType:", mimeType);
        const fileObject = {
          content: content.trim(),
          fileName: { name: fileName, required: true },
          mimeType: { type: mimeType, required: true },
        };
        formData[name] = fileObject;
      } else {
        formData[name] = content.trim();
      }
    }
  });
  return formData;
}
function collectRequestData(req, callback) {
  let body = "";

  req.on("data", (chunk) => {
    console.log(chunk);
    body += chunk.toString();
    console.log(body);
  });

  req.on("end", () => {
    callback(body);
  });
}
module.exports = {collectRequestData,parseDataIntoKeyValue} 
