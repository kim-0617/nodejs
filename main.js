const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./lib/db.js');
const topic = require('./lib/topic.js');
const author = require('./lib/author.js');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');

connection.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('images')); // images 폴더의 정적인 파일들을 서비스 가능하게 된다.
app.get('/null', (request, response) => response.status(204));
app.get('/page/null', (request, response) => response.status(204));
app.get('/create/null', (request, response) => response.status(204));
app.get('/update/null', (request, response) => response.status(204));
app.get('/author/update/null', (request, response) => response.status(204));
app.get('/favicon.ico', (req, res) => res.status(204));

app.use(session({
	key: 'is_logined',
	secret: 'mysecret',
	resave: false,
	saveUninitialized: false,
	store: new FileStore(),
}));

app.use(flash());

const passport = require('./lib/passport')(app);

app.get('/', (request, response) => {
	topic.home(request, response);
});
app.get('/login', (request, response) => {
	topic.login(request, response);
});
app.post(`/login_process`,
	passport.authenticate(`local`, {
		successRedirect: `/`,
		failureRedirect: `/login`,
	})
); // 데이터를 받았을 때 어떻게 처리할 것인가
app.get('/logout_process', (request, response) => {
	request.logout(function (err) {
		if (err) { return next(err); }
		// request.session.destroy((err) => {
		// 	response.redirect('/');
		// });
		request.session.save(() => {
			response.redirect('/');
		})
	});
});
/*
app.post('/login_process', (request, response) => {
	topic.login_process(request, response);
});
*/
/*
app.get('/logout_process', (request, response) => {
	topic.logout_process(request, response);
});
*/
app.get('/register', (request, response) => {
	topic.register(request, response);
});
app.post('/register_process', (request, response) => {
	topic.register_process(request, response);
});
app.get('/page/:id', (request, response) => {
	topic.page(request, response);
});
app.get('/create', (request, response) => {
	topic.create(request, response);
});
app.post('/create_process', (request, response) => {
	topic.create_process(request, response);
});
app.get('/update/:update_id', (request, response) => {
	topic.update(request, response);
});
app.post('/update_process', (request, response) => {
	topic.update_process(request, response);
});
app.post('/delete_process', (request, response) => {
	topic.delete_process(request, response);
});
app.get('/author', (request, response) => {
	author.home(request, response);
});
app.get('/author/create', (request, response) => {
	author.create(request, response);
});
app.get('/author/update/:update_id', (request, response) => {
	author.update(request, response);
});
app.post('/author/create_process', (request, response) => {
	author.create_process(request, response);
});
app.post('/author/update_process', (request, response) => {
	author.update_process(request, response);
});
app.post('/author/delete_process', (request, response) => {
	author.delete_process(request, response);
});

app.use((request, response, next) => {
	response.status(404).send("Sorry, can't find that");
});

// 어떤 미들웨어에서 next의 인자로 err가 넘어오게 되면, next의 다음 동작으로 수행되는 미들웨어는
// 인자가 4개인 미들웨어를 호출하도록 약속되어 있다.
// 따라서 여기에 Error Handling 을 하면 된다.
// app.use((err, request, response, next) => { 
// 	console.err(err.stack);
// 	response.status(500).send("Something Broke");
// });

app.listen(3000, () => {
	console.log("example app listening on port 3000~");
});
/*
const http = require('http');
const url = require('url');
const connection = require('./lib/db.js');
const topic = require('./lib/topic.js');
const author = require ('./lib/author.js');
connection.connect();

const app = http.createServer((request, response) => {
	let _url = request.url;
	let queryData = url.parse(_url, true).query;
	let pathname = url.parse(_url, true).pathname;
	if (pathname === '/') {
		if (queryData.id === undefined) {
			topic.home(request, response);
		}
		else {
			topic.page(request, response);
		};
	}
	else if (pathname === '/create') {
		topic.create(request, response);
	}
	else if (pathname === '/update') {
		topic.update(request, response);
	}
	else if (pathname === '/create_process') {
		topic.create_process(request, response);
	}
	else if (pathname === '/update_process') {
		topic.update_process(request, response);
	}
	else if (pathname === '/delete_process') {
		topic.delete_process(request, response);
	}
	else if (pathname === '/author') {
		author.home(request, response);
	}
	else if (pathname === '/author/create_process') {
		author.create_process(request, response);
	}
	else if (pathname === '/author/update') {
		author.update(request, response);
	}
	else if (pathname === '/author/update_process') {
		author.update_process(request, response);
	}
	else if (pathname === '/author/delete_process') {
		author.delete_process(request, response);
	}
	else {
		response.writeHead(404);
		response.end("Not Found...");
	}
});
app.listen(3000);
*/