let http = require('http');
let fs = require('fs');
let url = require('url');
let qs = require('querystring');
let path = require('path');
let sanitizeHtml = require('sanitize-html');
const template = require('./template.js');

const app = http.createServer((request, response) => {
	let _url = request.url;
	let queryData = url.parse(_url, true).query;
	let pathname = url.parse(_url, true).pathname;
	if (pathname === '/') {
		if (queryData.id === undefined) {
			fs.readdir('./data', (err, filelist) => {
				let title = 'Welcome';
				let description = 'Hello, Node.js';
				let list = template.List(filelist);
				let templates = template.HTML(title, list,
					`<h2>${title}</h2>${description}`,
					`<a href="/create">create</a>`);
				response.writeHead(200);
				response.end(templates);
			});
		}
		else {
			fs.readdir('./data', (err, filelist) => {
				let list = template.List(filelist);
				let title = queryData.id;
				let s_title = sanitizeHtml(title);
				let filteredId = path.parse(queryData.id).base;
				fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
					let s_desc = sanitizeHtml(description);
					let templates = template.HTML(s_title, list,
						`<h2>${s_title}</h2>${s_desc}`,
						`<a href="/create">create</a> 
						<a href="/update?id=${s_title}">update</a> 
						<form action="http://localhost:3000/delete_process" method="post" onsubmit = "return ()=>confirm("정말 삭제할까요?");">
							<input type="hidden" name="id" value="${s_title}">
							<input type="submit" value="delete">
						</form>
						`);
					response.writeHead(200);
					response.end(templates);
				});
			});
		};
	}
	else if (pathname === '/create') {
		fs.readdir('./data', (err, filelist) => {
			let title = 'Web - Create';
			let list = template.List(filelist);
			let templates = template.HTML(title, list, `
			<form action="http://localhost:3000/create_process" method="post">
				<p><input type="text" id="title" placeholder="title" name = "title"></p>
				<p><textarea id="desc" cols="30" rows="10" placeholder="desc" name = "desc"></textarea></p>
				<input type="submit">
			</form>
			`, `<a href="/create">create</a>`);
			response.writeHead(200);
			response.end(templates);
		});
	}
	else if (pathname === '/update') {
		fs.readdir('./data', (err, filelist) => {
			let list = template.List(filelist);
			let title = queryData.id;
			let filteredId = path.parse(queryData.id).base;
			fs.readFile(`data/${filteredId}`, "utf8", (err, description) => {
				let templates = template.HTML(title, list,
					`
					<form action="http://localhost:3000/update_process" method="post">
						<input type="hidden" name="id" value="${title}">
						<p><input type="text" value="${title}" placeholder="title" name = "title"></p>
						<p><textarea cols="30" rows="10" placeholder="desc" name = "desc">${description}</textarea></p>
						<input type="submit">
					</form>
					`,
					`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
				response.writeHead(200);
				response.end(templates);
			});
		});
	}
	else if (pathname === '/create_process') {
		let body = '';
		request.on('data', (data) => {
			body += data;
		});

		request.on('end', () => {
			let post = qs.parse(body);
			let title = post.title;
			let desc = post.desc;

			fs.writeFile(`data/${title}`, desc, 'utf-8', (err) => {
				if (err) throw err;
				console.log("File is saved!");
				response.writeHead(302, { Location: `http://localhost:3000/?id=${title}` });
				response.end();
			})
		});
	}
	else if (pathname === '/update_process') {
		let body = '';
		request.on('data', (data) => {
			body += data;
		});

		request.on('end', () => {
			let post = qs.parse(body);
			let title = post.title;
			let desc = post.desc;
			let id = post.id;

			fs.rename(`data/${id}`, `data/${title}`, (error) => {
				fs.writeFile(`data/${title}`, desc, 'utf-8', (err) => {
					if (err) throw err;
					response.writeHead(302, { Location: `http://localhost:3000/?id=${title}` });
					response.end();
				});
			});
		});
	}
	else if (pathname === '/delete_process') {
		let body = '';
		request.on('data', (data) => {
			body += data;
		});

		request.on('end', () => {
			let post = qs.parse(body);
			let id = post.id;
			let filteredId = path.parse(id).base;
			fs.unlink(`data/${filteredId}`,(err)=>{
				response.writeHead(302, { Location: `http://localhost:3000` });
				response.end();
			})
		});
	}
	else {
		response.writeHead(404);
		response.end("Not Found...");
	}
});
app.listen(3000);