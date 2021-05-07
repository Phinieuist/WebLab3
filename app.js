const express = require('express');
const port = 3002;
const app = express();

const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');


const bodyParser = require('body-parser');
const routes = require('./routes/routes');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use(
    session({
        secret: 'Mysecret',
        store: new FileStore(),
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        },
        resave: false,
        saveUninitialized: false

    })
);

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'public'));



app.get("/script.js", function (req, res) {
    res.sendFile(__dirname + "/script.js");
});

routes(app);

const server = app.listen(port, (error) => {
    if (error) return console.log(`Error: ${error}`);
 
    console.log(`Server listening on http://localhost:${server.address().port}`);
});

