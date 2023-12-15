const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("cards_game.sqlite");


/* db.run("INSERT INTO users(idU,pseudo,password) VALUES(?,?,?)",[99,"test can be delete","delete this"],(err)=>{
    console.log(err);
});
*/

db.all("SELECT * FROM users",(err,rows)=>{
    rows.forEach((element,index)=>{
        // console.log(element);
    });
});

function getUserById(id){
  let retour4=0;

  const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT pseudo FROM users WHERE idU = ?",[id],(err,rows)=>{
    if(rows.length>0){
      retour4 = rows[0].pseudo;
    }else{
      retour4 =  false;
    }
    //console.log(retour);
  });
  console.log(retour4)
  return retour4;
}

function existeId(id){

  let retour2;
  const db = new sqlite3.Database("cards_game.sqlite");
  retour2 = db.all("SELECT * FROM users WHERE idU = ?",[id],(err,rows)=>{
    return rows.length>=1;
    
  });
  console.log(retour2)
  return retour2;  
}


console.log(getUserById(99));

console.log(existeId(99));


db.close();
