const template = require('./template.js');
const connection = require('./db.js');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        let title = 'Welcome';
        let description = 'Hello, Node.js';
        let list = template.List(topics);
        let templates = template.HTML(title, list,
            `<h2>${title}</h2>${description}
            <img src = "http://localhost:3000/hello.jpg" style = "display : block; margin-top : 20px; width : 300px">`,
            `<a href="/create">create</a>`);
        response.send(templates);
    });
};

exports.page = (request, response) => {
    connection.query(`select * from topic`, (error, topics) => {
        if (error) throw error;
        connection.query(`select topic.id, title, description, name from topic left join author on author.id = topic.author_id where topic.id=?`,
            [request.params.id],
            (error2, topic) => {
                if (error2) throw error2;
                let title = topic[0].title;
                let description = topic[0].description;
                let list = template.List(topics);
                let templates = template.HTML(title, list,
                    `<h2>${sanitizeHtml(title)}</h2>
                ${sanitizeHtml(description)}
                <p>by ${sanitizeHtml(topic[0].name)}</p>`,
                    `<a href="/create">create</a> 
                <a href="/update/${topic[0].id}">update</a> 
                <form action="http://localhost:3000/delete_process" method="post">
                    <input type="hidden" name="id" value="${request.params.id}">
                    <input type="submit" value="delete">
                </form>`);
                response.send(templates);
            })
    })
};

exports.create = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        if (err) throw err;
        connection.query(`select * from author`, (err2, authors) => {
            if (err2) throw err2;
            let tag = template.AuthorSelect(authors);
            let title = 'Create';
            let list = template.List(topics);
            let templates = template.HTML(title, list, `
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
            response.send(templates);
        });
    });
};

exports.create_process = function (request, response) {
    let post = request.body;
    connection.query(`select * from author where name = ?`, [post.author], (err, author) => {
        if (err) throw err;
        connection.query(`insert into topic (title, description, created, author_id) values 
            (?, ?, NOW(), ?)`, [post.title, post.desc, author[0].id],
            (err2, result) => {
                if (err2) throw err2;
                response.redirect(`http://localhost:3000/page/${result.insertId}`)
            });
    });
};

exports.update = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        if (err) throw err;
        connection.query(`select * from topic where id = ?`, [request.params.update_id], (err2, topic) => {
            if (err2) throw err2;
            connection.query(`select * from author`, (err3, authors) => {
                if (err3) throw err3;
                let tag = template.AuthorSelect(authors, topic[0].author_id);
                let title = sanitizeHtml(topic[0].title);
                let list = template.List(topics);
                let templates = template.HTML("Update" + title, list, `
                <form action="http://localhost:3000/update_process" method="post">
                    <input type="hidden" name="id" value="${topic[0].id}">
                    <p><input type="text" value="${title}" placeholder="title" name = "title"></p>
                    <p><textarea cols="30" rows="10" placeholder="desc" name = "desc">${sanitizeHtml(topic[0].description)}</textarea></p>
                    <p>
                    <select name=author>
                    ${tag}
                    </select>
                    </p>
                    <input type="submit">
                </form>
                `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                response.send(templates);
            });
        });
    });
};

exports.update_process = (request, response) => {
    let post = request.body;
    connection.query(`select * from author where name = ?`, [post.author], (err, author) => {
        if (err) throw err;
        connection.query(`update topic set title = ?, description = ?, author_id = ? where id = ?`,
            [post.title, post.desc, author[0].id, post.id],
            (err2, result) => {
                if (err2) throw err2;
                response.redirect(`http://localhost:3000/page/${post.id}`)
            });
    });
};

exports.delete_process = (request, response) => {
    let post = request.body;
    connection.query(`delete from topic where id = ?`, [post.id], (err, result) => {
        if (err) throw err;
        response.redirect(`/`);
    })
};