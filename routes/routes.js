const fs = require("fs");
const filePath = "data.json";
const express = require('express');
const jsonParser = express.json();

const passport = require("passport");
const { send } = require("process");


const router = app => {
    app.get('/', (req, res) => {
        if(req.user == undefined)
            res.render('./views/pages/logIn.ejs', { email: undefined });
        else
            res.render('./views/pages/acc.ejs', { email: req.user.email, name: req.user.name });
    });

    app.get('/register', (req, res) => {
        if(req.user == undefined)
            res.render('./views/pages/register.ejs', { email: undefined });
        else
            res.render('./views/pages/register.ejs', { email: req.user.email });
    });

    app.post('/reg', (req, res, next) => {
        passport.authenticate('local-signup', function(err, user) {
            if(err){
                let error = { status: 'error', code: 400, message: 'Возникла непредвиденная ошибка!' };
                return res.send(error);
            }
            if(!user){
                let error = { status: 'error', code: 400, message: 'Возникла ошибка при регистрации!' };
                return res.send(error);
            }
            req.logIn(user, function(err) {
                if (err)
                {
                    let error = { status: 'error', code: 400, message: 'Возникла непредвиденная ошибка!' };
                    return res.send(error);
                }
                let response = {status: 'ok', code: 200, message: 'Регистрация прошла успешно!'};
                return res.send(response);
            });
        })(req, res, next);
    });

    app.post('/auth', (req, res, next) => {
        passport.authenticate('local-login', function(err, user) {
            if (err)
            {
                let error = { status: 'error', code: 400, message: 'Возникла непредвиденная ошибка!' };
                return res.send(error);
            }
            if (!user)
            {
                let error = { status: 'error', code: 400, message: 'Укажите правильный email или пароль!' };
                return res.send(error);
            }
            req.logIn(user, function(err){
                if (err)
                {
                    let error = { status: 'error', code: 400, message: 'Возникла непредвиденная ошибка!' };
                    return res.send(error);
                }
                let response = {status: 'ok', code: 200, message: 'Авторизация прошла успешно!'};
                return res.send(response);
            });
            
        })(req, res, next);
    });

    const auth =  (req, res, next) => {
        if(req.isAuthenticated())
            next();
        else
            return res.redirect('/');
    };

    app.get('/acc', (req, res, next) => {
        if(req.isAuthenticated())
            { 
                res.render('./views/pages/acc.ejs', { email: req.user.email, name: req.user.name } );               
            }
        else
            return res.redirect('/');
    });

    app.post('/regUpdate', auth, (req, res, next) => {
        passport.authenticate('local-update', function(err, user) {
            if (err)
            {
                let error = { status: 'error', code: 400, message: 'Возникла непредвиденная ошибка!' };
                return res.send(error);
            }
            if (!user)
            {
                let error = { status: 'error', code: 400, message: 'Возникла ошибка при смене пароля!' };
                return res.send(error);
            }
            if (user)
            {
                let response = {status: 'ok', code: 200, message: 'Редактирование данных прошло успешно!'};
                return res.send(response);
            }
        })(req, res, next);
    });

    app.get('/logout', (req, res) => {
        req.session.destroy(() => { 
            res.clearCookie('connect.sid'); 
            res.redirect('/');
        });
    });
    
    app.get('/ships', (request, response) => {
        const content = fs.readFileSync(filePath, "utf8");
        const ships = JSON.parse(content);
        response.send(ships);
    });

    app.get("/ships/:id", function(req, res){

        const id = req.params.id; // получаем id
        const content = fs.readFileSync(filePath, "utf8");
        const ships = JSON.parse(content);
        let one = null;
        for(var i=0; i<ships.length; i++){
            if(ships[i].id==id){
                one = ships[i];
                break;
            }
        }
        if(one){
            res.send(one);
        }
        else{
            res.status(404).send();
        }
    });

    app.get("/ships/search/:price", function (req, res) {
        const price = req.params.price;
        const content = fs.readFileSync(filePath, "utf8");
        const ships = JSON.parse(content);
        var shipOut = [];
    
        for (var i = 0; i < ships.length; i++) {
            if (ships[i].price < price) {
                var data = {
                    id: ships[i].id,
                    name: ships[i].name,
                    age: ships[i].age,
                    price: ships[i].price
                };
                shipOut.push(data);
            }
        }
        if (shipOut)
            res.send(shipOut);
        else
            res.status(404).send();
    });

    app.post("/ships", jsonParser, function (req, res) {

        if(!req.body) return res.sendStatus(400);
        
        let data = fs.readFileSync(filePath, "utf8");
        let ships = JSON.parse(data);
        const shipName = req.body.name;
        var shipAge = req.body.age;
        var shipPrice = req.body.price;

        
        if (!Number.isInteger(shipPrice)) 
            shipPrice = 0;

        if (!Number.isInteger(shipAge))
            shipAge = 0;
        
        let one = {name: shipName, age: shipAge, price: shipPrice};

        // находим свободный id
        var id = 1;
        while (1) 
        {
            for (var i = 0; i < ships.length; i++) 
            {
                if (ships[i].id == id) 
                {
                    id++;
                    i = -1;
                }
            }
        break;
        }

        one.id = id;
        ships.push(one);
        data = JSON.stringify(ships);
        // перезаписываем файл с новыми данными
        fs.writeFileSync("data.json", data);
        res.send(one);
    });
    
    app.delete("/ships/:id", function(req, res){

        const id = req.params.id;
        let data = fs.readFileSync(filePath, "utf8");
        let ships = JSON.parse(data);
        let index = -1;
        for(var i=0; i < ships.length; i++){
            if(ships[i].id==id){
                index=i;
                break;
            }
        }
        if(index > -1){
            const one = ships.splice(index, 1)[0];
            data = JSON.stringify(ships);
            fs.writeFileSync("data.json", data);
            res.send(one);
        }
        else{
            res.status(404).send();
        }
    });

    app.put("/ships", jsonParser, function(req, res){

        if(!req.body) return res.sendStatus(400);
    
        const shipId = req.body.id;
        const shipName = req.body.name;
        var shipAge = req.body.age;
        var shipPrice = req.body.price;
    
        let data = fs.readFileSync(filePath, "utf8");
        const ships = JSON.parse(data);
        let one;
        for(var i=0; i<ships.length; i++){
            if(ships[i].id == shipId){
                one = ships[i];
                break;
            }
        }
        if(one){

            if (!Number.isInteger(shipPrice)) 
                shipPrice = 0;

            if (!Number.isInteger(shipAge))
                shipAge = 0;

            one.price = shipPrice;
            one.age = shipAge;
            one.name = shipName;
            data = JSON.stringify(ships);
            fs.writeFileSync("data.json", data);
            res.send(one);
        }
        else{
            res.status(404).send(one);
        }
    });

    
}


module.exports = router;