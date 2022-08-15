const template = require('./template.js');
const connection = require('./db.js');
const sanitizeHtml = require('sanitize-html');

const authIsOwner = (request, response) => {
    if (request.user) {
        return true;
    }
    else {
        return false;
    }
};

const authStatusUI = (request, response) => {
    let authStatusUI = `<a href = "/login">login</a>`;

    if (authIsOwner(request, response)) {
        authStatusUI = `${request.user.nickname || request.user[0].nickname} | <a href = "/logout_process">logout</a>`
    }

    return authStatusUI;
};

exports.home = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        if (err) throw err;
        connection.query(`select * from users`, (err2, authors) => {
            if (err2) throw err2;
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
                `,
                ``, authStatusUI(request, response));
            response.send(templates);
        });
    });
}

/*
exports.create_process = (request, response) => {
    if(!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    let post = request.body;
    connection.query(`insert into author (name, profile) values 
        (?, ?)`, [post.name, post.profile],
        (err2, result) => {
            if (err2) throw err2;
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
}
*/

exports.update = (request, response) => {
    if (!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    connection.query(`select * from users where id = ?`, [request.params.update_id], (error, data) => {
        if (data[0].id !== (request.user.id || request.user[0].id)) {
            response.write("<script>alert('not yours')</script>");
            response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
            return false;
        }
        connection.query(`select * from topic`, (err, topics) => {
            if (err) throw err;
            connection.query(`select * from users`, (err2, authors) => {
                if (err2) throw err2;
                connection.query(`select * from users where id = ?`, [request.params.update_id], (err3, result) => {
                    if (err3) throw err3;
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
                            <p><input type = "text" name = "email" placeholder = "email" value = "${sanitizeHtml(result[0].email)}"></p>
                            <p><textarea name = "nickname" placeholder = "nickname">${sanitizeHtml(result[0].nickname)}</textarea></p>
                            <input type="submit" value = "update">
                        </form>
                        `,
                        ``, authStatusUI(request, response));
                    response.send(templates);
                })
            });
        });
    });

}

exports.update_process = (request, response) => {
    let post = request.body;
    connection.query(`update users set email = ?, nickname = ?  where id = ?`,
        [post.email, post.nickname, post.id],
        (err2, result) => {
            if (err2) throw err2;
            response.writeHead(302, { Location: `/author` });
            response.end();
        });
}

exports.delete_process = (request, response) => {
    if (!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    let post = request.body;
    connection.query(`select * from users where id = ?`, [post.id], (error, data) => {
        if (data[0].id !== (request.user.id || request.user[0].id)) {
            response.write("<script>alert('not yours')</script>");
            response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
            return false;
        }
        connection.query(`delete from topic where author_id = ?`, [post.id], (err, result1) => {
            if (err) throw err;
            connection.query(`delete from users where id = ?`,
                [post.id],
                (err2, result2) => {
                    if (err2) throw err2;
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
        });
    });
}