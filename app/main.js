const net = require("net");
const fs = require("fs");

let directory;

if (process.argv.length === 4) {
  if (process.argv[2] == "--directory") {
    directory = process.argv[3];
  }
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const d = data.toString();
    const [startLine, ...headers] = d.split("\r\n");

    const [httpMethod, path, httpVersion] = startLine.split(" ");

    if (httpMethod === "GET") {
      if (path === "/") {
        socket.write(`${httpVersion} 200 OK\r\n\r\n`);
      } else if (path.startsWith("/echo/")) {
        const str = path.slice(6);
        const res = `${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}\r\n`;
        socket.write(res);
      } else if (path === "/user-agent") {
        const userAgent = headers.find((h) => h.startsWith("User-Agen"));
        const str = userAgent.slice(12);
        const res = `${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}\r\n`;
        socket.write(res);
      } else if (path.startsWith("/files/")) {
        const fileName = path.slice(7);
        if (fs.existsSync(`${directory}${fileName}`)) {
          const content = fs.readFileSync(`${directory}${fileName}`, "utf-8");
          const res = `${httpVersion} 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`;
          socket.write(res);
        } else {
          socket.write(`${httpVersion} 404 NOT FOUND\r\n\n`);
          socket.end();
        }
      } else {
        socket.write(`${httpVersion} 404 NOT FOUND\r\n\r\n`);
      }
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
