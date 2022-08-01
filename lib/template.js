module.exports = {
	HTML : (title, list, body, control) => {
		return `
				<!doctype html>
				<html>
					<head>
						<title>WEB1 - ${title}</title>
						<meta charset="utf-8">
					</head>
					<body>
						<h1><a href="/">WEB</a></h1>
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
			list += `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`
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
			tag += `<option ${selected}>${authors[i].name}</option>`
		}
		return tag;
	}
};