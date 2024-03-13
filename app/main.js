const net = require("net");

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
        console.log(str);
        const res = `${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}\r\n`;
        socket.write(res);
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
