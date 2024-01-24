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
        if (this.joueurs[joueur].idJoueur==idJoueur){
            this.goal-=(this.joueurs[joueur].main.length+this.paquets[joueur].length)
            this.joueurs.splice(joueur)
            this.paquets.splice(joueur)
        
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
        this.goal = 0;
        this.createDeck();
        this.shuffleDeck();
        this.type="Bataille"
        this.paquets = [];

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
            this.goal++;
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
    this.égalité = false;
    this.tourCourant++;
     
    var pactole=[];//Cartes en jeu
    var winner=this.joueurs[0];
    this.joueurségalité = [this.joueurs[0]];
    for (var joueur in this.joueurs){
        if (this.joueurs[joueur].choix!=null){pactole.push(this.joueurs[joueur].choix)};
        if (this.joueurs[joueur].éliminé==false&&(winner.choix==null||(this.joueurs[joueur].choix.valeur>winner.choix.valeur))){winner=this.joueurs[joueur];this.joueurségalité = [this.joueurs[joueur]];this.égalité=false;}//Cas d'égalité, il sera pris en charge par serveur.js selon le retour de cette fonction
        else{if (this.joueurs[joueur].éliminé==false&&this.joueurs[joueur].choix.valeur==winner.choix.valeur&&(joueur!=0)){
            this.joueurségalité.push(this.joueurs[joueur]); 
          
            this.égalité=true;}}

    }   

    if (this.égalité==true){this.pactoleAttente = pactole;this.emptyChoices();
        for (var joueur in this.joueurs){
            if (this.joueurs[joueur].main.length==0){
                if (this.paquets[joueur].length==0){this.joueurs[joueur].éliminé=true;}//éliminé s'il n'a ni main, ni paquet
                else{this.joueurs[joueur].main = this.paquets[joueur];this.paquets[joueur]=[];}
            }
                }
                return false;}//On stoppe car il faut refaire un pli.



    for (var joueur in this.joueurs){//Le gagnant remporte les cartes du pli
        if (this.joueurs[joueur]==winner){
            for (var carte of pactole){
                this.paquets[joueur].push(carte)
            }
        }
    }


    //On remet les paquets dans la main de chaque joueur
    for (var joueur in this.joueurs){
if (this.joueurs[joueur].main.length==0){
    if (this.paquets[joueur].length==0){this.joueurs[joueur].éliminé=true;}//éliminé s'il n'a ni main, ni paquet
    else{this.joueurs[joueur].main = this.paquets[joueur];this.paquets[joueur]=[];}
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
for (var joueur in this.joueurségalité){
    for (var i of this.joueurs){
        if (i.éliminé!=false&&joueur.idJoueur==i.idJoueur){this.pactoleAttente.push(i.choix);}
        if (this.joueurségalité[joueur].idJoueur==i.idJoueur && (winner.choix==null||(i.choix.valeur>winner.choix.valeur))){winner = i;winners = [winner];égalitédouble=false}
        else if (this.joueurségalité[joueur].idJoueur==i.idJoueur && i.choix.valeur==winner.choix.valeur&&(joueur!=0)){égalitédouble=true;winners.push(i);}
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
this.égalité=false;
this.pactoleAttente = null;
this.joueurségalité = null;
this.égalitédouble = false;
this.shufflePaquets();
this.emptyChoices();

    for (var joueur in this.joueurs){
        if (this.joueurs[joueur].main.length==0){
            if (this.paquets[joueur].length==0){this.joueurs[joueur].éliminé=true;}//éliminé s'il n'a ni main, ni paquet
            else{this.joueurs[joueur].main = this.paquets[joueur];this.paquets[joueur]=[];}
        }
            }

    return false;
}

    else {//Le gagnant de l'égalité récolte tout 
    while (this.pactoleAttente.length>0){
        for (var joueur in this.joueurs){
            if (this.joueurs[joueur].idJoueur==winner.idJoueur){
                    
                this.paquets[joueur].push(this.pactoleAttente.shift())
                }
        }
    }
    this.égalité=false;
    this.pactoleAttente = null;
    this.joueurségalité = null;
    this.égalitédouble = false;
    this.shufflePaquets();
    this.emptyChoices();

    for (var joueur in this.joueurs){
        if (this.joueurs[joueur].main.length==0){
            if (this.paquets[joueur].length==0){this.joueurs[joueur].éliminé=true;}//éliminé s'il n'a ni main, ni paquet
            else{this.joueurs[joueur].main = this.paquets[joueur];this.paquets[joueur]=[];}
        }
            }

return winner;
}//On prépare pour poursuivre

}

existeWinner(){//Renvoie false si aucun gagnant, true si une personne a gagné
    for (var joueur in this.joueurs){

        if (this.joueurs[joueur].main.length+this.paquets[joueur].length>=(this.goal)){
            
            return this.joueurs[joueur]}
    }
return false;
}

}


//----------------------------Classe utilisée pour le jeu du 6quiprend-----------------------------

class sixquiprend extends Game{
    constructor(host,nbJoueurs){
        super([""],105,host,nbJoueurs);
        this.createDeck();
        this.deck.shift();  
        this.shuffleDeck();
        this.type="6quiprend"
        this.lignes = [[],[],[],[]]
        this.joueurQuiChoisit = null;
        this.tourEnCours = false;
        
    }

    initGame(){//Initialisation de la game lorsque l'hôte le souhaite OU que le nombre de joueurs == le nombre max de joueurs.

        for (var joueur of this.joueurs){
            joueur.score = 0;
            for (let i = 0;i<10;i++){//Distribution équitable des cartes
                    joueur.main.push(this.drawCarte());

                }
            }
        
            for (let i=0;i<4;i++){
                this.lignes[i].push(this.drawCarte())
            }
           
        this.hasStarted = true;
        this.isOver = false;
        }

        canTour(){//Teste si le tour peut démarrer, donc si tous les joueurs ont fait un choix
    
            for (var joueur of this.joueurs){
                if (joueur.choix==null){return false}
            }
            return true
        }

        prendreLigne(idJoueur,ligne){ //Le joueur désigné par l'idJoueur passé en paramètre prend la ligne désignée par l'entier ligne
            if (this.joueurQuiChoisit == null || this.joueurQuiChoisit!=idJoueur){
                return false;
            }
            for (var joueur of this.joueurs){
                if (joueur.idJoueur==idJoueur && joueur.choix==null){
                    return false;}}



            var score = 0;
            for (var card of this.lignes[ligne]){
            if ((card.valeur%11!=0)&&(card.valeur%5!=0)){score+=1}

            if (card.valeur % 11 == 0) {score += 5;}
            if (card.valeur % 10 == 0) {score += 3;} 
            else {if (card.valeur % 10 == 5) {score += 2;}}
          
            }
           

            for (var joueur of this.joueurs){
                if (joueur.idJoueur==idJoueur){
                    joueur.score+=score;
                }
                this.lignes[ligne] = [joueur.choix]
            }
                return true
        }

        placerCarte(idJoueur){//effectue le placement automatique de la carte que le joueur a choisie et renvoie true si c'est possible, false s'il doit prendre une ligne
            var retour;
            for (var joueur of this.joueurs){
                if (joueur.idJoueur==idJoueur){
                    var choix = joueur.choix.valeur;
                    var lignePlacement = 0

                    //TEST DE SI OUI OU NON IL EST POSSIBLE DE PLACER UNE CARTE
                    let canPlay = false;
                    for (var ligne of this.lignes){
                   
                        if (ligne[ligne.length-1].valeur<choix){
                            canPlay = true;
                        }
                    }
                    if (canPlay==false){return false;}

                    for (var ligne in this.lignes){
                        if (Math.abs(this.lignes[ligne][this.lignes[ligne].length-1].valeur-choix)<Math.abs(this.lignes[lignePlacement][this.lignes[lignePlacement].length-1].valeur-choix)){
                            lignePlacement = ligne;
                    }
                 }

                 if (this.lignes[lignePlacement].length<5){
                    this.lignes[lignePlacement].push(joueur.choix);
                    retour = joueur.choix.valeur;
                    joueur.choix=null;
                 }

                if (this.lignes[lignePlacement].length>=5){
                    this.prendreLigne(joueur.idJoueur,lignePlacement);
                }


                 return true;

                }
            }
        }


        joueurMin(){//Retourne l'id du joueur qui a mis la carte dont la valuer est la plus petite
            var min = null
            for (var joueur of this.joueurs){
                if ((min==null) || ((joueur.choix!=null) && (joueur.choix.valeur<min.choix.valeur))){
                    min = joueur;
                }
            }

            if (min == null){
                return false
            }
            return min.idJoueur;
        }










}

module.exports = { Game,Bataille,sixquiprend }
