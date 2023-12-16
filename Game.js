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
        this.joueursMax = joueursMax;
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
    for (var joueur of this.joueurs){
        if (joueur.idJoueur==idJoueur){
            return false;
        }
    }

    if (this.joueurs.length<this.joueursMax){
    this.joueurs.push(new Joueur(idJoueur,false));
    
    return true
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

emptyChoices(){//Pour les fins de tour
    for (var joueur of this.joueurs){
        joueur.choix = null;
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

    constructor(host,nbJoueurs){
        super(["coeur","pique","trefle","carreau"],13,host,nbJoueurs);
        this.createDeck();
        this.paquets = [];
        this.type="Bataille"

    }

    shufflePaquets(){//Mélange les paquets de chaque joueur
        for (var paquet of this.paquets){
        paquet = paquet.sort((a, b) => 0.5 - Math.random());
        }
    }
//-----------------------Fonctions gestion jeu----------------------------------------------

initGame(){//Initialisation de la game lorsque l'hôte le souhaite OU que le nombre de joueurs == le nombre max de joueurs.

while (this.deck.length>=this.joueurs.length){//Distribution équitable des cartes
        for (var joueur of this.joueurs){
            joueur.main.push(this.drawCarte());
        }
    }

    for (var joueur of this.joueurs){this.paquets.push([])}
this.hasStarted = true;

}

canTour(){//Teste si le tour peut démarrer, donc si tous les joueurs ont fait un choix

    for (var joueur of this.joueurs){
        if (joueur.éliminé==false && joueur.choix==null){return false}
    }
    return true
}

tour(){
    this.tourCourant++;
     
    var pactole=[];//Cartes en jeu
    var winner=this.joueurs[0];
    for (var joueur in this.joueurs){
        pactole.push(this.joueurs[joueur].choix);
        if (this.joueurs[joueur].choix.valeur>winner.choix.valeur){winner=this.joueurs[joueur];this.égalité=false;}//Cas d'égalité, il sera pris en charge par serveur.js selon le retour de cette fonction
        else{if (this.joueurs[joueur].choix.valeur==winner.choix.valeur&&this.joueurs[joueur]!=winner){this.joueurségalité=[winner,this.joueurs[joueur]];this.égalité=true;}}
    }   

    if (this.égalité==true){this.pactoleAttente = pactole;this.emptyChoices();return false;}//On stoppe car il faut refaire un pli.



    for (var joueur in this.joueurs){//Le gagnant remporte les cartes du pli
        if (this.joueurs[joueur]==winner){
            for (var carte of pactole){
                this.paquets[joueur].push(carte)
            }
        }
    }


    //On remet les paquets dans la main de chaque joueur
    this.shufflePaquets();
    for (var joueur in this.joueurs){
if (this.joueurs[joueur].main.length==0){
    if (this.paquets[joueur].length==0){this.joueurs[joueur].éliminé=true;}//éliminé s'il n'a ni main, ni paquet
    else{this.joueurs[joueur].main = this.paquets[joueur]}
}
    }
this.emptyChoices();
return winner;
}

canTour(){//Teste si le tour peut démarrer, donc si tous les joueurs ont fait un choix

    for (var joueur of this.joueurs){
        if (joueur.éliminé==false && joueur.choix==null&&this.joueurs.includes(joueur)){return false}
    }
    return true
}

canTourégalité(){//Teste si le tour peut démarrer, donc si tous les joueurs ont fait un choix

    for (var joueur of this.joueurségalité){
        if (joueur.éliminé==false && joueur.choix==null&&this.joueurs.includes(joueur)){return false}
    }
    return true
}

tourégalité(){
    var égalitédouble = false;//teste si l'égalité est une égalité
    var winner = this.joueurségalité[0];
    var winners = []
for (var joueur of this.joueurségalité){
    for (var i of this.joueurs){
        if (joueur.idJoueur==i.idJoueur){this.pactoleAttente.push(i.choix);}
        if (joueur.idJoueur==i.idJoueur && i.choix.valeur>winner.choix.valeur){winner = i;winners = [winner];égalitédouble=false}
        else if (joueur.idJoueur==i.idJoueur && i.choix.valeur==winner.choix.valeur){égalitédouble=true;winners.push(i);}
    }
}


if (égalitédouble){//On distribue les cartes équitablement entre membres du tour d'égalité
    while (this.pactoleAttente.length>0){
        for (var i of winners){
            for (var joueur in this.joueurs){
                if (this.joueurs[joueur].idJoueur==i.idJoueur && this.pactoleAttente.length>0){
                    this.paquets[joueur].push(this.pactoleAttente.shift())
                }
            }            
        }
    }
}

    else {//Le gagnant de l'égalité récolte tout 
    while (this.pactoleAttente.length>0){
        for (var joueur in this.joueurs){
            if (this.joueurs[joueur].idJoueur==winner.idJoueur){
                    
                this.paquets[joueur].push(this.pactoleAttente.shift())
                }
        }
    }


}//On prépare pour poursuivre
this.égalité=false;
this.pactoleAttente = null;
this.joueurségalité = null;
this.égalitédouble = false;
this.shufflePaquets();
}

existeWinner(){//Renvoie false si aucun gagnant, true si une personne a gagné
    for (var joueur in this.joueurs){
        if (this.joueurs[joueur].main.length+this.paquets[joueur]==(this.couleurs.length*this.nbvaleurs)){return this.joueurs[joueur]}
    }
return false;
}

}

module.exports = { Game,Bataille };