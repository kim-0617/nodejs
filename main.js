let http = require('http');
let fs = require('fs');
let url = require('url');
let qs = require('querystring');
let path = require('path');
let mysql = require('mysql');
let sanitizeHtml = require('sanitize-html');
const template = require('./lib/template.js');
let connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'kim',
	password : 'kim0617',
	database : 'opentutorials'
});
connection.connect();

const app = http.createServer((request, response) => {
	let _url = request.url;
	let queryData = url.parse(_url, true).query;
	let pathname = url.parse(_url, true).pathname;
	if (pathname === '/') {
		if (queryData.id === undefined) {
			connection.query(`select * from topic`, (err, topics)=>{
				let title = 'Welcome';
				let description = 'Hello, Node.js';
				let list = template.List(topics);
				let templates = template.HTML(title, list,
					`<h2>${title}</h2>${description}`,
					`<a href="/create">create</a>`);
				response.writeHead(200);
				response.end(templates);
			});
		}
		else {
			connection.query(`select * from topic`, (error, topics)=>{
				if(error) throw error;
				connection.query(`select topic.id, title, description, name 
				from topic left join author on author.id = topic.author_id where topic.id=?`, 
				[queryData.id],
				(error2, topic)=>{
					if(error2) throw error2;
					let title = topic[0].title;
					let description = topic[0].description;
					let list = template.List(topics);
					let templates = template.HTML(title, list,
						`<h2>${title}</h2>
						${description}
						<p>by ${topic[0].name}</p>`,
						`<a href="/create">create</a> 
						<a href="/update?id=${topic[0].id}">update</a> 
						<form action="http://localhost:3000/delete_process" method="post">
							<input type="hidden" name="id" value="${queryData.id}">
							<input type="submit" value="delete">
						</form>`);
					response.writeHead(200);
					response.end(templates);
				})
			})
		};
	}
	else if (pathname === '/create') {
		connection.query(`select * from topic`, (err, topics)=>{
			if(err) throw err;
			connection.query(`select * from author`, (err2, authors)=>{
				if(err2) throw err2;
				let tag = template.AuthorSelect(authors);
				let title = 'Create';
				let list = template.List(topics);
				let templates = template.HTML(title, list,`
					<form action="http://localhost:3000/create_process" method="post">
						<p><input type="text" id="title" placeholder="title" name = "title"></p>
						<p><textarea id="desc" cols="30" rows="10" placeholder="desc" name = "desc"></textarea></p>
						<p><select name = 'author'>
						${tag}
						</select>
						</p>
						<input type="submit">
					</form>
					`, `<a href="/create">create</a>`);
				response.writeHead(200);
				response.end(templates);
			})
		});
	}
	else if (pathname === '/update') {
		connection.query(`select * from topic`, (err, topics)=>{
			if(err) throw err;
			connection.query(`select * from topic where id = ?`,[queryData.id], (err2, topic)=>{
				if(err2) throw err2;
				connection.query(`select * from author`, (err3, authors) => {
					if(err3) throw err3;
					let tag = template.AuthorSelect(authors, topic[0].author_id);
					let title = topic[0].title;
					let list = template.List(topics);
					let templates = template.HTML("Update" + title, list,`
					<form action="http://localhost:3000/update_process" method="post">
						<input type="hidden" name="id" value="${topic[0].id}">
						<p><input type="text" value="${title}" placeholder="title" name = "title"></p>
						<p><textarea cols="30" rows="10" placeholder="desc" name = "desc">${topic[0].description}</textarea></p>
						<p>
						<select name=author>
						${tag}
						</select>
						</p>
						<input type="submit">
					</form>
					`,
					`<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
					response.writeHead(200);
					response.end(templates);
				});
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
			connection.query(`select * from author where name = ?`, [post.author], (err, author)=>{
				if(err) throw err;
				connection.query(`insert into topic (title, description, created, author_id) values 
				(?, ?, NOW(), ?)`, [post.title, post.desc, author[0].id],
				(err2, result)=>{
				if(err2) throw err2;
				response.writeHead(302, { Location: `http://localhost:3000/?id=${result.insertId}` });
				response.end();
			});
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
			connection.query(`select * from author where name = ?`,[post.author], (err, author)=>{
				if(err) throw err;
				connection.query(`update topic set title = ?, description = ?, author_id = ? where id = ?`,
				[post.title, post.desc, author[0].id, post.id], 
				(err2, result)=>{
					if (err2) throw err2;
						response.writeHead(302, { Location: `http://localhost:3000/?id=${post.id}` });
						response.end();
				});
			})
		});
	}
	else if (pathname === '/delete_process') {
		let body = '';
		request.on('data', (data) => {
			body += data;
		});

		request.on('end', () => {
			let post = qs.parse(body);
			connection.query(`delete from topic where id = ?`, [post.id], (err, result)=>{
				if(err) throw err;
				response.writeHead(302, { Location: `/` });
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