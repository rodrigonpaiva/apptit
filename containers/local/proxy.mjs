import http from 'node:http';
// The published applications keep their loopback-only network contract.
// Only this HTTP entry is bound to the namespace interface and published on host loopback.
http.createServer((request, response) => {
  const upstream = http.request({ hostname: '127.0.0.1', port: 3000, path: request.url, method: request.method, headers: request.headers }, result => {
    response.writeHead(result.statusCode, result.headers); result.pipe(response);
  });
  upstream.on('error', () => { if (!response.headersSent) response.writeHead(502); response.end('Local web service unavailable'); });
  request.on('aborted', () => upstream.destroy());
  response.on('close', () => upstream.destroy());
  request.pipe(upstream);
}).listen(8080, '0.0.0.0');
