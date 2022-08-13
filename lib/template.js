const sanitizeHtml = require('sanitize-html');
module.exports = {
	HTML : (title, list, body, control, authStatusUI = `<a href = "/login">login</a>`) => {
		return `
				<!doctype html>
				<html>
					<head>
						<title>WEB1 - ${title}</title>
						<meta charset="utf-8">
					</head>
					<body>
						${authStatusUI}
						<h1><a href="/">WEB</a></h1>
							<a href = "/author">author</a>
							${list}
							${control}
							${body}
					</body>
				</html>
				`;
	},
	List : (topics) => {
		let list = '<ul>';
		let i = 0;
		while (i < topics.length) {
			list += `<li><a href="/page/${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`
			i++;
		}
		list += '</ul>';
		return list;
	},
	AuthorSelect : (authors, author_id) => {
		let tag = '';
		
		for(let i = 0; i < authors.length; i++){
			let selected = '';
			if(authors[i].id === author_id) selected = ' selected';
			tag += `<option ${selected}>${sanitizeHtml(authors[i].name)}</option>`
		}
		return tag;
	},
	authorList : (authors) => {
		let table = '<table>';
		table += `<tr>
		<th>작가</th>
		<th>프로필</th>
		<th>수정</th>
		<th>삭제</th>
		</tr>`
		for(let i = 0; i < authors.length; i++){
			table += '<tr>';
			table += `<td>${sanitizeHtml(authors[i].name)}</td>`
			table += `<td>${sanitizeHtml(authors[i].profile)}</td>`
			table += `<td><a href = "/author/update/${authors[i].id}">update</a></td>`
			table += `<td>
			<form action = "/author/delete_process" method = post>
				<p><input type = "hidden" name = "id" value = ${authors[i].id}></p>
				<input type="submit" value = "delete">
			</form>
			</td>`
			table += '</tr>';
		}
		table += '</table>';
		return table;
	}
};