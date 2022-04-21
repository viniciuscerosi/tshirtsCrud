const express = require('express');
const porta = 8080;
const app = express();
var i18n = require("i18n");

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.get('/',(req,res)=>{
    res.status(200).send("work");
});

i18n.configure({
    locales: ["pt", "en"],
    directory: __dirname+"/locais",
    cookie: "receitas"
});

app.use(i18n.init);

require('./controlers/controler')(app);
app.listen(porta);