const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("cards_game.sqlite");


db.run("INSERT INTO users(idU,pseudo,password) VALUES(?,?,?)",[99,"test can be delete","delete this"],(err)=>{
    console.log(err);
});


db.all("SELECT * FROM users",(err,rows)=>{
    rows.forEach((element,index)=>{
        console.log(element);
    });
});



db.close();