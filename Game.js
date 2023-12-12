const { Carte } = require('./Carte.js');
const { Joueur } = require('./Joueur.js');
class Game {

    constructor(couleurs,nbvaleurs,host/*host est un id d'utilisateur et crée une instance de la classe "joueur*/,joueursMax/*Nombre maximal de joueurs dans la partie, on peut néanmoins la start avant*/) {

        this.id = "";//L'ID sera utilisé pour identifier chaque partie de manière indépendante. Ainsi, on pourra en avoir plusieurs simultanément.
        for (var i=0;i<9;i++){
            this.id = this.id+""+Math.floor(Math.random()*10);
        }
        
        this.tourCourant = 0;
        this.couleurs = couleurs;
        this.nbvaleurs = nbvaleurs;
        this.deck = [];//Représente les cartes présentes dans le deck utilisé par la partie
        this.joueurs = [new Joueur(host,true)];
        this.joueursMax = this.joueursMax;
        this.hasStarted = false;
        this.chat = [];



    }
//-----------------------Fonctions gestion cartes------------------------------------------
    shuffleDeck(){
        this.deck = this.deck.sort((a, b) => 0.5 - Math.random());
    }

    createDeck(){//Crée un deck selon les spécifications de l'instance (valeurs et couleurs), puis le mélange
        for (var couleur of this.couleurs){
            for (var i=0;i<this.nbvaleurs;i++){
                this.deck.push(new Carte(i,couleur));
            }
        }
        this.shuffleDeck();
    }

    shuffleDeck(){//Mélange le deck
        this.deck = this.deck.sort((a, b) => 0.5 - Math.random());
    }

    drawCarte(){//Renvoie une carte au hasard du deck et l'en retire
       
        var retour = this.deck[0];
        this.deck.shift();
        return retour;
    }

//-----------------------Fonctions gestion jeu----------------------------------------------



//-----------------------Fonctions gestion joueurs------------------------------------------
addPlayer(idJoueur){
    if (this.joueurs.length<this.joueursMax){
    this.joueurs+= new Joueur(idJoueur,false);return true
}
else{return false;}
}
removePlayer(idJoueur){
    for (var joueur in this.joueurs){
        if (joueurs[joueur].id==idJoueur){
            this.joueurs.splice(joueur)
        }
    }
}



//-----------------------Fonctions gestion chat-----------------------------------------

message(origine,message){
    if (this.chat.length>10){this.chat.splice();}
    this.chat.push(origine+" : "+message);
}

}


//----------------------------Classe utilisée pour le jeu de la bataille-----------------------------

class Bataille extends Game{

    constructor(host){
        super(["coeur","pic","trèfle","carreau"],13,host);
        this.createDeck();
        this.paquets = [];

    }

    shufflePackets(){//Mélange les packets de chaque joueur
        for (var packet of this.packets){
        packet = packet.sort((a, b) => 0.5 - Math.random());
        }
    }
//-----------------------Fonctions gestion jeu----------------------------------------------

initGame(){//Initialisation de la game lorsque l'hôte le souhaite OU que le nombre de joueurs == le nombre max de joueurs.
   
    while (this.deck.length>=this.joueurs.length){//Distribution équitable des cartes
        for (var joueur of this.joueurs){
            joueur.main.push(this.drawCarte());
        }
    }

this.hasStarted = true;

}






}
module.exports = { Game,Bataille };