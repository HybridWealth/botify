const http = require('node:http');
const hostname = '127.0.9.10';
const port = 2003;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World, this a NodeJS script for creating a HTTP server.\n');
});
server.listen(port, hostname, () => {
  console.log(`Adedolapo, your Server is up and running at http://${hostname}:${port}/`);
});
