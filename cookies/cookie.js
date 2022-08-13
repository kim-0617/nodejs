const http = require('http');
const cookie = require('cookie');

http.createServer((request, response)=>{
    let cookies = {};
    if(request.headers.cookie !== undefined){
        cookies = cookie.parse(request.headers.cookie);
    }
    console.log(cookies);
    response.writeHead(200, {
        'Set-Cookie' : [
            // 'yummy_cookie=choko', 
            // 'tasty_cookie=strawberry',
            // `Permanent=cookies; Max-Age = ${60*60*24*3}`,
            // `Secure=Secure; Secure`,
            // `HttpOnly=HttpOnly; HttpOnly`,
            // `Path=Path; Path=/cookie`,
        ]
    });
    response.end("cookies");
}).listen(3000);