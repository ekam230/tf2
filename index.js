const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/sessions.db');


app.use(bodyParser.json());

const port = 3000;


//Пользователи для Login page
let users = [{
        username: 'admin',
        password: '12345'
    },
    {
        username: 'foo',
        password: '12345'
    },
    {
        username: 'user',
        password: '12345'
    },
]

//Pug передумал использовать
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: true
}));

//сессии храним в Sqlite
app.use(session({
    store: new SQLiteStore({
        dir: './db/',
        db: 'sessions.db'
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'supersecret' //Passphrase
}));


//Основная точка входа
app.get('/', function (req, res) {
    if (req.session.username) {
        res.redirect('/app')
    } else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }

});

app.post('/login', function (req, res) {
    //Поиск пользователя в массиве
    let FoundUser;
    for (let i = 0; i < users.length; i++) {
        let u = users[i];
        if (u.username == req.body.username && u.password == req.body.password) {
            FoundUser = u.username;
            break;
        }
    }

    if (FoundUser !== undefined) {
        req.session.username = FoundUser;
        console.log("Login succeed: ", req.session.username);
        // res.send('Login succeful: '+ 'sessionID: '+ req.session.id + '; user:'+ req.session.username);
        res.redirect('/app');
    } else {
        console.log('Login failed: ', req.body.username);
        res.status(401).send('Login error');
    }

});

app.get('/app', function (req, res) {
    if (req.session.username) {
        // res.render('profile', {
        //     title: 'Check Page',
        //     message: req.session.username
        // })
        // res.set('Content-Type','text/html');
        // res.send('<h2>User ' + req.session.username + ' is logged');
        // res.sendFile(path.join(__dirname,'profile.html'));
        res.sendFile(path.join(__dirname, '/apl/app.html'));
    } else {
        // res.send('not logged in')
        res.redirect('/');
    }
})


//API
//Получение списка из базы
app.get("/api/users", (req, res, next) => {
    if (req.session.username) {
        var sql = "select * from users"
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({
                    "error": err.message
                });
                return;
            }
            res.send(rows)
        });
    } else {
        res.send('not logged in')
    }
});


//Запись в базу
app.post("/api/users/", (req, res) => {
    var data = {
        login: req.body.login,
        password: req.body.password
    }
    var sql = 'INSERT INTO users (login, password) VALUES (?,?)'
    var params = [data.login, data.password]
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({
                "error": err.message
            })
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    });
})


//Обновление
app.patch("/api/user/:id", (req, res) => {
    var data = {
        login: req.body.login,
        password: req.body.password
    }
    db.run(
        `UPDATE users set 
           login = COALESCE(?,login), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.login, data.password, req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({
                    "error": res.message
                })
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
        });
})


//Удаление
app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM users WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({
                    "error": res.message
                })
                return;
            }
            res.json({
                "message": "deleted",
                changes: this.changes
            })
        });
})


//Завершение сессии и выход
app.get('/logout', function (req, res) {
    req.session.username = ''
    console.log('User logout');
    res.redirect('/');
})

app.listen(port, function () {
    console.log('Start on port: ', +port);
});