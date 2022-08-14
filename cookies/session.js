const express = require('express');
const parseurl = require('parseurl') ;
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();

app.use(session({
    secret : `apsjfoisejfosjf`,
    resave : false,
    saveUninitialized : true,
    store : new FileStore(),
}));

app.get('/', (request, response) => {
    console.log(request.session);
    if(request.session.num === undefined){
        request.session.num = 1;
    }
    else{
        request.session.num += 1;
    }
    response.send(`Views : ${request.session.num}`)
});

app.listen(3000, () => {
    console.log('3000!');
})