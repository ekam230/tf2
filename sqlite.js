var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/sessions.db');
// let users = []

// let users2;
// db.serialize(function () {
//     users2 = db.run('SELECT rowid AS id, info FROM lorem', () => {})
//     // db.run('CREATE TABLE lorem (info TEXT)');
//     // var stmt = db.prepare('INSERT INTO lorem VALUES (?)');

//     // for (var i = 0; i < 10; i++) {
//     //     stmt.run('Ipsum ' + i);
//     // }

//     // stmt.finalize();

//     db.each('SELECT rowid AS id, info FROM lorem', function (err, row) {
//         // console.log(row.id + ': ' + row.info);
//         // console.log(row.id)
//         users.push({
//             "login": row.id,
//             "password": row.info
//         });
//     });
// });

// db.close();

// setInterval(() => console.log(users), 5000)

// console.log(users2)

//
let data = ['Admin5', '9999999', 'Admin3'];
let sql = `UPDATE users
            SET login = ?,password = ?
            WHERE login = ?`;

db.run(sql, data, function (err) {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Row(s) updated: ${this.changes}`);

});

// close the database connection
db.close();