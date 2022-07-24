const fs = require('fs');
let a = '';

fs.readFile('sample.txt', 'utf-8', (err, data) => {
    if (err) throw err;
    a = data;
});

console.log(a);