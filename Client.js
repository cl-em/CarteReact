const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("cards_game.sqlite");


/* db.run("INSERT INTO users(idU,pseudo,password) VALUES(?,?,?)",[99,"test can be delete","delete this"],(err)=>{
    console.log(err);
});
*/

let l={};

db.all("SELECT * FROM parties_bataille ",(err,row)=>{
  console.log(row);
})


db.close();


// console.log(getUserById(99));

// console.log(existeId(99));

