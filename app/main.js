const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    if (data.toString().includes("GET / HTTP/1.1")) {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
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
