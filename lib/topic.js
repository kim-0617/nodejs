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
    let authStatusUI = `<a href = "/login">login</a> | <a href = "/register">register</a>`;

    if (authIsOwner(request, response)) {
        authStatusUI = `${request.user[0].nickname} | <a href = "/logout_process">logout</a>`
    }

    return authStatusUI;
};

exports.home = (request, response) => {
    console.log(request.user);
    connection.query(`select * from topic`, (err, topics) => {
        let title = 'Welcome';
        let description = 'Hello, Node.js';
        let list = template.List(topics);
        let templates = template.HTML(title, list,
            `<h2>${title}</h2>${description}
            <img src = "http://localhost:3000/hello.jpg" style = "display : block; margin-top : 20px; width : 300px">`,
            `<a href="/create">create</a>`,
            authStatusUI(request, response)
        );
        response.send(templates);
    });
};

exports.login = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        let title = 'Login';
        let list = template.List(topics);
        let templates = template.HTML(title, list,
            `<form action='login_process' method ='post'>
                <p><input type="text" name = "email" placeholder = "email"></p>
                <p><input type="password" name = "password" placeholder = "password"></p>
                <p><input type="submit" value = "sign"></p>
            </form>`,
            `<a href="/create">create</a>`);
        response.send(templates);
    });
};

exports.register = (request, response) => {
    connection.query(`select * from topic`, (err, topics) => {
        let title = 'Register';
        let list = template.List(topics);
        let templates = template.HTML(title, list,
            `<form action='register_process' method ='post'>
                <p><input type="text" name = "email" placeholder = "email"></p>
                <p><input type="password" name = "password" placeholder = "password"></p>
                <p><input type="password" name = "password2" placeholder = "password_confirm"></p>
                <p><input type="text" name = "nickname" placeholder = "nickname"></p>
                <p><input type="submit" value = "register"></p>
            </form>`,
            `<a href="/create">create</a>`);
        response.send(templates);
    });
};

exports.register_process = (request, response) => {
    let post = request.body;
    let emails = [];

    connection.query(`select * from users`, (err, topics) => {
        topics.forEach((row) => {
            emails.push(row.email);
        });
        if (emails.includes(post.email)) {
            response.write("<script>alert('email already exist!')</script>");
            response.write(`<script>window.location="http://localhost:3000/register"</script>`);
            return false;
        }
        if (!post.email || !post.nickname || !post.password || !post.password2) {
            response.write("<script>alert('fill all blank!')</script>");
            response.write(`<script>window.location="http://localhost:3000/register"</script>`);
            return;
        }
        if (post.password === post.password2) {
            connection.query(`insert into users (email, password, nickname, created) values 
                    (?, ?, ?, NOW())`, [post.email, post.password, post.nickname],
                (err2, result) => {
                    if (err2) throw err2;
                    let user = {
                        email: post.email,
                        password: post.password,
                        nickname: post.nickname,
                    }
                    request.login(user, (err3) => {
                        return response.redirect(`/`);
                    });
                });
        }
        else {
            response.write("<script>alert('password must same!')</script>");
            response.write(`<script>window.location="http://localhost:3000/register"</script>`);
            return;
        }
    });

}

exports.page = (request, response) => {
    connection.query(`select * from topic`, (error, topics) => {
        if (error) throw error;
        connection.query(`select topic.id, title, description, email from topic left join users on users.id = topic.author_id where topic.id=?`,
            [request.params.id],
            (error2, topic) => {
                if (error2) throw error2;
                let title = topic[0].title;
                let description = topic[0].description;
                let list = template.List(topics);
                let templates = template.HTML(title, list,
                    `<h2>${sanitizeHtml(title)}</h2>
                ${sanitizeHtml(description)}
                <p>by ${sanitizeHtml(topic[0].email)}</p>`,
                    `<a href="/create">create</a> 
                <a href="/update/${topic[0].id}">update</a> 
                <form action="http://localhost:3000/delete_process" method="post">
                    <input type="hidden" name="id" value="${request.params.id}">
                    <input type="submit" value="delete">
                </form>`, authStatusUI(request, response));
                response.send(templates);
            })
    })
};

exports.create = (request, response) => {
    if (!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    connection.query(`select * from topic`, (err, topics) => {
        if (err) throw err;
        connection.query(`select * from users`, (err2, authors) => {
            if (err2) throw err2;
            let title = 'Create';
            let list = template.List(topics);
            let templates = template.HTML(title, list, `
                <form action="http://localhost:3000/create_process" method="post">
                    <p><input type="text" id="title" placeholder="title" name = "title"></p>
                    <p><textarea id="desc" cols="30" rows="10" placeholder="desc" name = "desc"></textarea></p>
                    </p>
                    <input type="submit">
                </form>
                `, `<a href="/create">create</a>`, authStatusUI(request, response));
            response.send(templates);
        });
    });
};

exports.create_process = (request, response) => {
    let post = request.body;
    connection.query(`select * from users where email = ?`, [request.user[0].email], (err, author) => {
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
    if (!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    connection.query(`select * from topic where id = ?`, [request.params.update_id], (error, data) => {
        if (data[0].author_id !== request.user[0].id) {
            response.write("<script>alert('not yours')</script>");
            response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
            return false;
        }
        connection.query(`select * from topic`, (err, topics) => {
            if (err) throw err;
            connection.query(`select * from topic where id = ?`, [request.params.update_id], (err2, topic) => {
                if (err2) throw err2;
                connection.query(`select * from users`, (err3, authors) => {
                    if (err3) throw err3;
                    let title = sanitizeHtml(topic[0].title);
                    let list = template.List(topics);
                    let templates = template.HTML("Update" + title, list, `
                    <form action="http://localhost:3000/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" value="${title}" placeholder="title" name = "title"></p>
                        <p><textarea cols="30" rows="10" placeholder="desc" name = "desc">${sanitizeHtml(topic[0].description)}</textarea></p>
                        <p>
                        </p>
                        <input type="submit">
                    </form>
                    `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`, authStatusUI(request, response));
                    response.send(templates);
                });
            });
        });
    });
};

exports.update_process = (request, response) => {
    let post = request.body;
    connection.query(`select * from users where email = ?`, [request.user[0].email], (err, author) => {
        if (err) throw err;
        connection.query(`update topic set title = ?, description = ?, author_id = ? where id = ?`,
            [post.title, post.desc, author[0].id, post.id],
            (err2, result) => {
                if (err2) throw err2;
                response.redirect(`http://localhost:3000/page/${post.id}`);
            });
    });
};

exports.delete_process = (request, response) => {
    if (!authIsOwner(request, response)) {
        response.write("<script>alert('login please')</script>");
        response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
        return false;
    }
    let post = request.body;
    connection.query(`select * from topic where id = ?`, [post.id], (error, data) => {
        if(data[0].author_id !== request.user[0].id){
            response.write("<script>alert('not yours')</script>");
            response.write(`<script>window.location=\"http://localhost:3000\"</script>`);
            return false;
        }
        connection.query(`delete from topic where id = ?`, [post.id], (err, result) => {
            if (err) throw err;
            response.redirect(`/`);
        });
    });
};


// no use
exports.login_process = (request, response) => {
    /*
    let post = request.body;
    // if(post.email === 'egoing777@gmail.com' && post.password === '111111'){
    //     response.writeHead(302, {
    //         "Set-Cookie" : [
    //             `email = ${post.email}`,
    //             `password = ${post.password}`,
    //             `nickname = egoing`,
    //         ],
    //         location : `/`,
    //     });
    //     response.end();
    // }
    // else{
    //     response.end('Who?');
    // }
    if (post.email === 'egoing777@gmail.com' && post.password === '111111') {
        request.session.is_logined = true;
        request.session.nickname = `egoing`;
        request.session.save(() => {
            response.redirect(`/`);
        });
    }
    else {
        response.send(`Who?`);
    }
    */
};

exports.logout_process = (request, response) => {
    // response.writeHead(302, {
    //     "Set-Cookie": [
    //         `email = ; Max-Age=0`,
    //         `password = ; Max-Age=0`,
    //         `nickname = ; Max-Age=0`,
    //     ],
    //     location: `/`,
    // });
    // response.end("Abc");

    // request.session.destroy((err) => {
    //     response.redirect('/');
    // });
}