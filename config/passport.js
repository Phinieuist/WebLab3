const express = require("express");
const jsonParser = express.json();
const fs = require("fs");
const dbFilePath = 'Users.json';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const CryptoJS = require("crypto-js");
const key = "SecretKey";


function ReadFile(){
    
    var result = fs.readFileSync(dbFilePath, "utf8");
    if(result){
       let data = JSON.parse(result);
       if(data['status'] == 'ok'){
           return data;
       }
    }
    return undefined;
}

passport.serializeUser(function(user, done){
    //console.log('Сериализация: ', user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    //console.log('Десериализация: ', id);

    const result = ReadFile();
    if(result == undefined) done (null, false);

    const user = result.users.find(x => x.id  == id);
    if(user == undefined) done (null, false);
    
    let userUp = {
        id: user.id,
        email: user.email,
        name: user.name
    };

    done(null, userUp);
});

//авторизация
passport.use('local-login', new LocalStrategy(
    { 
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true 
    }, 
    function(req, email, password, done){
        
        const result = ReadFile();
        if(result == undefined) done(null, false);

        const user = result.users.find(x => {
            var bytes  = CryptoJS.AES.decrypt(x.password, key);
            var originalText = bytes.toString(CryptoJS.enc.Utf8);
            if(x.email == email && originalText == password) {
                return true;
            }
            return false;
        });
        if(user == undefined) done(null, false);

        let userUp = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        return done(null, userUp);
    })
);

//регистрация
passport.use('local-signup', new LocalStrategy( 
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        const name = req.body.name;

        var result = ReadFile();
        if(result == undefined) return done(null, false);

        var user = result.users.find(x => x.email == email);
        if(user != undefined) return done(null, false);

        let maxId = 0;
        var users = result.users;
        if(users.length != 0){
            maxId = Math.max.apply(Math, users.map( (x) => { return x.id } ));
        }
    
        user = {
            id: maxId + 1,
            email: email,
            password: CryptoJS.AES.encrypt(password, key).toString(),
            name: name
        };
    
        result.users.push(user);
        var data = JSON.stringify(result);
        fs.writeFileSync(dbFilePath, data);

        let userUp = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        return done(null, userUp);
    })
);

//обновление данных пользователя
passport.use('local-update', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done){
        const newpassword = req.body.newpassword;
        const name = req.body.name;

        var result = ReadFile();
        if(result == undefined) return done(null, false);

        var user = result.users.find(x => {
            var bytes  = CryptoJS.AES.decrypt(x.password, key);
            var originalText = bytes.toString(CryptoJS.enc.Utf8);
            if(x.email == req.user.email && originalText == password) {
                return true;
            }
            return false;
        });
        if(user == undefined) return done(null, false);

        user.email = email;
        user.password = CryptoJS.AES.encrypt(newpassword, key).toString();
        user.name = name;

        var data = JSON.stringify(result);
        fs.writeFileSync(dbFilePath, data);

        let userUp = {
            id: user.id,
            email: user.email,
            name: user.name
        };

        return done(null, userUp);
    })
);