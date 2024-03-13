const net = require("net");
const fs = require("fs");

const getDirectoryFromArgs = () => {
  if (process.argv.length === 4 && process.argv[2] === "--directory") {
    return process.argv[3];
  }
  return null;
};

const directory = getDirectoryFromArgs();

const sendResponse = (
  socket,
  { status = 200, statusText = "OK", contentType = "text/plain", body = "" }
) => {
  const headers = `Content-Type: ${contentType}\r\nContent-Length: ${Buffer.byteLength(
    body
  )}\r\n\r\n`;
  socket.write(`HTTP/1.1 ${status} ${statusText}\r\n${headers}${body}`);
};

const handleGetRequest = (socket, path, headers) => {
  if (path === "/") {
    sendResponse(socket, { body: "Welcome!" });
  } else if (path.startsWith("/echo/")) {
    const str = path.slice(6);
    sendResponse(socket, { body: str });
  } else if (path === "/user-agent") {
    const userAgent = headers.find((h) => h.startsWith("User-Agent")).slice(12);
    sendResponse(socket, { body: userAgent });
  } else if (path.startsWith("/files/") && directory) {
    const fileName = path.slice(7);
    const filePath = `${directory}/${fileName}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      sendResponse(socket, {
        contentType: "application/octet-stream",
        body: content,
      });
    } else {
      sendResponse(socket, {
        status: 404,
        statusText: "NOT FOUND",
        body: "File not found",
      });
    }
  } else {
    sendResponse(socket, {
      status: 404,
      statusText: "NOT FOUND",
      body: "Page not found",
    });
  }
};

const handlePostRequest = (socket, path, body) => {
  if (path.startsWith("/files/") && directory) {
    const fileName = path.slice(7);
    fs.writeFileSync(`${directory}/${fileName}`, body);
    sendResponse(socket, { status: 201, statusText: "CREATED" });
  }
};

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const [startLine, ...headers] = data.toString().split("\r\n");
    const [httpMethod, path, _httpVersion] = startLine.split(" ");

    switch (httpMethod) {
      case "GET": {
        handleGetRequest(socket, path, headers);
        break;
      }
      case "POST": {
        const body = headers.pop();
        handlePostRequest(socket, path, body);
        break;
      }
    }
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
