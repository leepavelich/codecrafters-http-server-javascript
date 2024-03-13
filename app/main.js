const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const d = data.toString();
    if (d.startsWith("GET")) {
      const [get, path, httpVersion] = d.split(" ");
    }
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo/")) {
      const str = path.split("/").at(-1);
      console.log(str);
    } else {
      socket.write("HTTP/1.1 404 NOT FOUND\r\n\r\n");
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
