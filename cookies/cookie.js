const http = require('http');

http.createServer((request, response)=>{
    response.writeHead(200, {
        'Set-Cookie' : ['yummy_cookie=choko', 'tasty_cookie=strawberry']
    });

    console.log(request.headers.cookie);
    response.end('Cookie!');
}).listen(3000);