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
	List : (filelist) => {
		let list = '<ul>';
		let i = 0;
		while (i < filelist.length) {
			list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
			i++;
		}
		list += '</ul>';
		return list;
	},
};