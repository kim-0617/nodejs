const template = require('./template.js');
const connection = require('./db.js');
const qs = require('querystring');
const url = require('url');
const sanitizeHtml = require('sanitize-html');

exports.home = (request, response) => {
    connection.query(`select * from topic`, (err, topics)=>{
        if(err) throw err;
        connection.query(`select * from author`, (err2, authors) => {
            if(err2) throw err2;
            let title = 'author';
            let list = template.List(topics);
            let templates = template.HTML(title, list,
                `${template.authorList(authors)}
                <style>
                    table{
                        border-collapse : collapse;
                        margin-top : 20px;
                    }
                    th{
                        border : 1px solid black;
                        font-weight: normal;
                        padding : 10px;
                    }
                    td{
                        border : 1px solid black;
                        padding : 10px;
                    }
                </style>
                <form action = "/author/create_process" method = post>
                    <p><input type = "text" name = "name" placeholder = "name"></p>
                    <p><textarea name = "profile" placeholder = "profile"></textarea></p>
                    <input type="submit" value = "create">
                </form>
                `,
                ``);
            response.writeHead(200);
            response.end(templates);
        });
    });
}

exports.create_process = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });

    request.on('end', () => {
        let post = qs.parse(body);
        connection.query(`insert into author (name, profile) values 
        (?, ?)`, [post.name, post.profile],
        (err2, result)=>{
            if(err2) throw err2;
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
    });
}

exports.update = (request, response) => {
    connection.query(`select * from topic`, (err, topics)=>{
        if(err) throw err;
        connection.query(`select * from author`, (err2, authors) => {
            if(err2) throw err2;
            let _url = request.url;
	        let queryData = url.parse(_url, true).query;
            connection.query(`select * from author where id = ?`, [queryData.id], (err3, result) => {
                if(err3) throw err3;    
                let title = 'author';
                let list = template.List(topics);
                let templates = template.HTML(title, list,
                    `${template.authorList(authors)}
                    <style>
                        table{
                            border-collapse : collapse;
                            margin-top : 20px;
                        }
                        th{
                            border : 1px solid black;
                            font-weight: normal;
                            padding : 10px;
                        }
                        td{
                            border : 1px solid black;
                            padding : 10px;
                        }
                    </style>
                    <form action = "/author/update_process" method = post>
                        <p><input type = "hidden" name = "id" value = ${result[0].id}></p>
                        <p><input type = "text" name = "name" placeholder = "name" value = ${sanitizeHtml(result[0].name)}></p>
                        <p><textarea name = "profile" placeholder = "profile">${sanitizeHtml(result[0].profile)}</textarea></p>
                        <input type="submit" value = "update">
                    </form>
                    `,
                    ``);
                response.writeHead(200);
                response.end(templates);
            })
        });
    });
}

exports.update_process = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });

    request.on('end', () => {
        let post = qs.parse(body);
        connection.query(`update author set name = ?, profile = ?  where id = ?`, 
        [post.name, post.profile, post.id],
        (err2, result)=>{
            if(err2) throw err2;
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
    });
}

exports.delete_process = (request, response) => {
    let body = '';
    request.on('data', (data) => {
        body += data;
    });

    request.on('end', () => {
        let post = qs.parse(body);
        connection.query(`delete from topic where author_id = ?`, [post.id], (err, result1) => {
            if(err) throw err;
            connection.query(`delete from author where id = ?`, 
            [post.id],
            (err2, result2)=>{
                if(err2) throw err2;
                response.writeHead(302, { Location: `/author` });
                response.end();
            });
        })
    });
}