const { Carte,CarteShadowHunter } = require('./Carte.js');
const { Joueur, JoueurShadowHunter } = require('./Joueur.js');
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

    static fromJSON(data){
        var retour = new Bataille(data.joueurs[0].idJoueur,data.joueursMax);
        // retour.joueurs = data.joueurs;
        // créer une liste d'objets joueurs avec joueur.fromJSON et itérer sur les joueurs de data afin de remplir
        retour.joueurs = [];
        for (var joueur of data.joueurs){
            retour.joueurs.push(Joueur.fromJSON(joueur));
        }
        retour.paquets = data.paquets;
        retour.deck = data.deck;
        retour.goal = data.goal;
        retour.hasStarted = data.hasStarted;
        retour.tourCourant = data.tourCourant;
        retour.id = data.id;
        retour.chat = data.chat;
        return retour;
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
       
        }

        static fromJSON(data){
            var retour = new sixquiprend(data.joueurs[0].idJoueur,data.joueursMax);
            // retour.joueurs = data.joueurs;
            // créer une liste d'objets joueurs avec joueur.fromJSON et itérer sur les joueurs de data afin de remplir
            retour.joueurs = [];
            for (var joueur of data.joueurs){
                retour.joueurs.push(Joueur.fromJSON(joueur));
            }
            retour.lignes = data.lignes;
            retour.deck = data.deck;
            retour.hasStarted = data.hasStarted;
            retour.tourCourant = data.tourCourant;
            retour.id = data.id;
            retour.chat = data.chat;
            retour.joueurQuiChoisit = data.joueurQuiChoisit;
            retour.tourEnCours = data.tourEnCours;
            return retour;
        }

        canTour(){//Teste si le tour peut démarrer, donc si tous les joueurs ont fait un choix
    
            for (var joueur of this.joueurs){
                if (joueur.choix==null){return false}
            }
            return true
        }

        prendreLigne(idJoueur,ligne){ //Le joueur désigné par l'idJoueur passé en paramètre prend la ligne désignée par l'entier ligne

            for (var joueur of this.joueurs){
                if ((joueur.idJoueur==idJoueur) && (joueur.choix==null)){
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
                    this.lignes[ligne] = [joueur.choix]
                    joueur.choix = null;
                    return true
                }
            }
            return false
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
                    if (canPlay==false){this.joueurQuiChoisit = joueur.idJoueur;return false;}

                    for (var ligne in this.lignes){//Calcul de la ligne où placer
                        if ((choix>this.lignes[ligne][this.lignes[ligne].length-1].valeur) && (((choix<this.lignes[lignePlacement][this.lignes[lignePlacement].length-1].valeur))||(Math.abs(this.lignes[ligne][this.lignes[ligne].length-1].valeur-choix)<Math.abs(this.lignes[lignePlacement][this.lignes[lignePlacement].length-1].valeur-choix)))){
                            lignePlacement = ligne;
                    }
                 }

                 if (this.lignes[lignePlacement].length<5){//Si ligne non pleine, le joueur voit sa carte se placer
                    this.lignes[lignePlacement].push(joueur.choix);
                    retour = joueur.choix.valeur;
                    joueur.choix=null;
                 }
                else {//Sinon, il la prend !
                    this.prendreLigne(joueur.idJoueur,lignePlacement);
                    joueur.choix=null;
                }


                 return true;

                }
            }
        }


        joueurMin(){//Retourne l'id du joueur qui a mis la carte dont la valuer est la plus petite
            var min = null
            for (var joueur of this.joueurs){
                if ((min==null) || min.choix==null ||((joueur.choix!=null) && (joueur.choix.valeur<min.choix.valeur))){
                    min = joueur;
                }
            }

            if (min == null || min.choix==null){
                return false
            }
            
            return min;
        }


        redistrib(){


            if (this.joueurs[0].main.length>0){
                return;
            }

            this.deck = []
            this.lignes = [[],[],[],[]]

            this.createDeck();
            this.deck.shift();  
            this.shuffleDeck();

            for (var joueur of this.joueurs){
     
                for (let i = 0;i<10;i++){//Distribution équitable des cartes
                        joueur.main.push(this.drawCarte());
    
                    }
                }
                for (let i=0;i<4;i++){
                    this.lignes[i].push(this.drawCarte())
                }
        }

        isOver() {
            for (var joueur of this.joueurs){
                if (joueur.score>=66){return true}
            }
            return false;
        }

        rank() {
            var retour = this.joueurs;
            retour.sort(function(a,b) {return a.score-b.score});
            return retour;
        }







}
class shadowHunter extends Game{

    
    constructor(host,nbJoueurs){
        super([""],105,host,nbJoueurs);
        this.deck = null//Le deck ne servira pas et on utilisera trois piles à la place
        this.couleurs = null//Pareil pour les couleurs. On préférera utiliser l'attribut "type" des cartes
        this.type="shadowHunter"
        this.joueurCourant = undefined
        this.state = undefined
        this.variableTemp = undefined
        //Choix des personnages
        this.shadows = ["Liche","Loup-Garou","Métamorphe","Vampire","Valkyrie","Momie"].sort((a, b) => 0.5 - Math.random());
        this.hunters = ["Gregor","Georges","Fu-ka","Franklin","Emi","Ellen"].sort((a, b) => 0.5 - Math.random());
        this.neutres = ["Bob","Allie","Agnès","Bryan","David","Daniel","Catherine","Charles"].sort((a, b) => 0.5 - Math.random());
        this.personnages = []

        var s = 0
        var h = 0
        var n = 0
        while(this.personnages.length<this.joueursMax){

            if ((this.joueursMax-this.personnages.length==1 || s+h>n*2) && (s==h)){
                this.personnages.push(this.neutres.shift())
                n++
                console.log("neutres: "+n)
            }
            else{
    
                    if (s<h){
                        this.personnages.push(this.shadows.shift())
                        s++
                        console.log("shadow: "+s)
                    }
                    else{
                        this.personnages.push(this.hunters.shift())
                        h++
                        console.log("hunters: "+h)
                    
                }
            }


        } 
        
        this.joueurs= [new JoueurShadowHunter(host,true,this.personnages.shift())]

        //Création des piles en question
        this.blanches = []
        this.blanches.push(new CarteShadowHunter('Avènement_Suprême', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Barre_De_Chocolat', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Boussole_Mystique', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Bénédiction', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Ange_Gardien', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Eau_Bénite', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Eau_Bénite', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Broche_De_Chance', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Amulette', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Toge_Sainte', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Lance_De_Longinus', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Crucifix_En_Argent', 'équipement'))
        this.blanches.push(new CarteShadowHunter('Miroir_Divin', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Premiers_Soins', 'consommable'))
        this.blanches.push(new CarteShadowHunter('Savoir_Ancestral', 'consommable'))

        this.noires = []
       /* this.noires.push(new CarteShadowHunter('Chauve-Souris_Vampire', 'consommable'))
        this.noires.push(new CarteShadowHunter('Araignée_Sanguinaire', 'consommable'))
        this.noires.push(new CarteShadowHunter('Dynamite', 'consommable'))
        this.noires.push(new CarteShadowHunter('Hache_Tueuse', 'équipement'))
        this.noires.push(new CarteShadowHunter('Chauve-Souris_Vampire', 'consommable'))*/
        this.noires.push(new CarteShadowHunter('Peau_De_Banane', 'consommable'))
        /*this.noires.push(new CarteShadowHunter('Poupée_Démoniaque', 'consommable'))
        this.noires.push(new CarteShadowHunter('Rituel_Diabolique', 'consommable'))
        this.noires.push(new CarteShadowHunter('Araignée_Sanguinaire', 'consommable'))
        this.noires.push(new CarteShadowHunter('Sabre_Hanté_Masamune', 'équipement'))
        this.noires.push(new CarteShadowHunter('Succube_Tentatrice', 'consommable'))
        this.noires.push(new CarteShadowHunter('Revolver_Des_Ténèbres', 'équipement'))
        this.noires.push(new CarteShadowHunter('Hachoir_Maudit', 'équipement'))
        this.noires.push(new CarteShadowHunter('Chauve-Souris_Vampire', 'consommable'))
        this.noires.push(new CarteShadowHunter('Mitrailleuse_Funeste', 'équipement'))
        this.noires.push(new CarteShadowHunter('Tronçonneuse_Du_Mal', 'équipement'))*/
        
        this.visions = []
        this.visions.push(new CarteShadowHunter('Vision_Cupide', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Divine', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Enivrante', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Foudroyante', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Furtive', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Lugubre', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Mortifère', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Purificatrice', 'vision'))
        this.visions.push(new CarteShadowHunter('Vision_Suprême', 'vision'))
        
        this.défausseNoire = []
        this.défausseBlanche = []
        this.défausseVisions = []
        this.zones = []
        for (var i=1;i<=6;i++){
            this.zones.push(("zone"+i))
        }
        
    }

    //-------------------------Fonction de gestion de la partie-------------------------------------------

    zonesAdjacentes(zo1,zo2){
        if (zo1==zo2){return true}
        if (zo1>zo2){var z1=zo2;var z2 = zo1}
        else{var z1 = zo1;var z2 = zo2}

      return (((z2-z1)==1)&&(z1%2==0))

    }

     shuffle(array)  { 
        for (let i = array.length - 1; i > 0; i--) { 
          const j = Math.floor(Math.random() * (i + 1)); 
          [array[i], array[j]] = [array[j], array[i]]; 
        } 
        return array; 
      }; 

    getDeath(){
        for (var test of this.joueurs){
            if (test.hurtPoint>=test.hp && test.éliminé!=false){
                test.éliminé=true
                return test.idJoueur
            }
        }
        return false
    }

    getWinners(){//Fonction renvoyant un tableau contenant les idJoueurs des gagnants, ou "false" s'il n'y en a pas encore

    }



    initGame(){//Initialisation de la game lorsque l'hôte le souhaite OU que le nombre de joueurs == le nombre max de joueurs.
        this.joueurs.push(new JoueurShadowHunter(3,false,"Allie",10))
        this.joueurs.push(new JoueurShadowHunter(4,false,"Allie",10))
        for (var i=0;i<3;i++){  
        this.joueurs[i].objets.push("Tronçonneuse_Du_Mal")
        this.blanches =this.shuffle(this.blanches)
       this.noires = this.shuffle(this.noires)
      this.visions = this.shuffle(this.visions)
       this.shuffle(this.zones)
       }
        //Don des PV aux joueurs

//---------------------test----------------------








        for (var joueur of this.joueurs){
            var char = joueur.character
            var hp
                if (char=="Allie" ||char=="Agnès"){hp=8}
                if (char=="Bob" ||char=="Bryan" ||char=="Emi" || char=="Ellen"){hp=10}
                if (char=="Catherine" ||char=="Charles" || char=="Métamorphe" || char=="Momie"){hp=11}
                if (char=="Franklin"||char=="Fu-ka"){hp=12}
                if (char=="Valkyrie"||char=="Vampire"||char=="Daniel"||char=="David"){hp=13}
                if (char=="Liche"||char=="Loup-Garou"||char=="Georges"||char=="Gregor"){hp=13}


            joueur.hp = hp
        }
        this.hasStarted = true;
        this.joueurCourant = this.joueurs[0].idJoueur
        this.joueurs[0].turnsToPlay = 1
        this.state = "débutTour"
       
        }

        addPlayer(idJoueur){
            for (var joueur of this.joueurs){
                if (joueur.idJoueur==idJoueur){
                    return false;
                }
            }
        
            if (this.joueurs.length<this.joueursMax){
            this.joueurs.push(new JoueurShadowHunter(idJoueur,false,this.personnages.shift(),10));
            return true
        }
        else{return false;}}



        getIdFromCharacter(char){
            for (var joueur of this.joueurs){
                if (joueur.character==char){
                    return joueur.idJoueur;
                }
                return null
            }
        }

        getIndexFromZone(zone){
            for (var z in this.zones){
                if (this.zones[z]==zone){
                    return parseInt(z)
                }
            }
            return false
        }

        getNameFromZone(zone){
            switch (zone){
                case "zone1":
                    return "l'antre de l'ermite"
                case "zone2":
                    return "la porte de l'outremonde"
                case "zone3":
                    return "le monastère"
                case "zone4":
                    return "le cimetière"
                case "zone5":
                    return "la forêt hantée"
                case "zone6":
                    return "le sanctuaire ancien"
                
            }
        }


        //---------------------------------FONCTIONS DE GESTION DES CARTES PIOCHEES---------------------------------------------
        drawVerte(idJoueur){
            var joueur;
            for (var test of this.joueurs){//Trouver le joueur concerné
                if (test.idJoueur == idJoueur){
                    joueur = test;
                }
            }
            this.joueurCourant = joueur.idJoueur
            this.state = this.vertes.shift().valeur
            this.défausseVisions.push(this.state)
        }

        drawBlanche(idJoueur){
            var joueur;
            for (var test of this.joueurs){//Trouver le joueur concerné
                if (test.idJoueur == idJoueur){
                    joueur = test;
                }
            }

            var carte = this.blanches.shift()
            this.défausseBlanche.push(carte.valeur)
            if (carte.type=="équipement"){
                joueur.objets.push(carte.valeur)//Les inventaires sont juste des listes de string, pas besoin de plus.
            }
            else{
                switch (carte.valeur) {
                    case "Ange_Gardien":
                        joueur.protected = true;
                        break;
                    case "Avènement_Suprême":
                        if (this.hunters.includes(joueur.character)){
                        this.joueurCourant = joueur.idJoueur
                        this.state = "Avènement_Suprême"
                        }
                        break;
                    case "Barre_De_Chocolat":
                        if ((joueur.révélé==true) && joueur.hp<=11){
                            joueur.hurtPoint = 0
                        }
                        if (joueur.révélé = false && joueur.hp<=11){
                            this.state = "Barre_De_Chocolat"
                            this.joueurCourant = joueur.idJoueur
                        }
                        break;
                    case "Bénédiction":
                        this.state = "Bénédiction"
                        this.joueurCourant = joueur.idJoueur
                    break;
                    case "Eau_Bénite":
                        joueur.hurtPoint-=2
                        if (joueur.hurtPoint<0){joueur.hurtPoint = 0}
                    break;
                    case "Miroir_Divin":
                      if (this.shadows.includes(joueur.character)){
                        joueur.révélé = true
                      }
                    break;
                    case "Premiers_Soins":
                        this.state = "Premiers_Soins"
                        this.joueurCourant = joueur.idJoueur
                    break;
                    case "Savoir_Ancestral":
                        joueur.turnsToPlay++
                    break;
                
                    default:
                        break;
                }
            }


            return carte.valeur
        }




drawNoire(idJoueur){//Retourne {valeur,data}, valeur c'est le nom de la carte et data les trucs en plus, surtout pour la dynamite
    var joueur
    for (var test of this.joueurs){//Trouver le joueur concerné
        if (test.idJoueur == idJoueur){
            joueur = test;
        }
    }

    var carte = this.noires.shift()
    this.défausseNoire.push(carte.valeur)

    var data;
    if (carte.type=="équipement"){
        joueur.objets.push(carte.valeur)//Les inventaires sont juste des listes de string, pas besoin de plus.
        this.state = "phase_Attaque"
    }
    else{
        switch (carte.valeur) {
            case "Araignée_Sanguinaire":
                this.state = "Araignée_Sanguinaire";
                this.joueurCourant = joueur.idJoueur
                break;
            case "Chauve-Souris_Vampire":
                this.joueurCourant = joueur.idJoueur
                this.state = "Chauve-Souris_Vampire"
                break;
            case "Dynamite":
                var destination = Math.floor(Math.random()*6)
                for (var test of this.joueurs){
                    if (parseInt(test.position)==destination||this.zonesAdjacentes(parseInt(test.position),destination)){
                        test.hurtPoint+=3
                    }
                    data = destination
                    console.log("destination de la dynamite:"+data)
                }

              
                break;
            case "Peau_De_Banane":
                if (joueur.objets.length==0){
                    joueur.hurtPoint++
                    data = "noItems"
                }
                else{
                    this.state = "Peau_De_Banane_1"
                    this.joueurCourant = joueur.idJoueur
                    data="Items"
                }

            break;
            case "Poupée_Démoniaque":
              this.state = "Poupée_Démoniaque"
              this.joueurCourant = joueur.idJoueur
            break;

            case "Rituel_Diabolique":

                this.state = "Rituel_Diabolique"
                this.joueurCourant = joueur.idJoueur
            

            break;
            case "Succube_Tentatrice":
                if (this.canSteal(this.joueurCourant)){
                this.state = "Succube_Tentatrice"
                this.joueurCourant = joueur.idJoueur}
                else{this.state="phase_Attaque"}
            break;
        
            default:
                break;
        }
    }
    return {"valeur":carte.valeur,"data":data}
}
        //---------------------------------FONCTIONS DE JEU---------------------------------------------

        takeDamage(player,damage){//Attention, player est un objet joueur à qui faire les dégâts, pas un idJoueur
            if (damage==0){return false}
            if (player.hasItem("Toge_Sainte")){player.hurtPoint+=damage-1}
            else{player.hurtPoint+=damage}

            if (player.isDead()){return true}
            return false
        }

        canAttack(atk,def){//Définit si le joueur d'id atk peut attaquer le jouer d'id def
          
            var attaquant = null;
            var défenseur = null;
            for (var joueur of this.joueurs){
                if (joueur.idJoueur==atk){attaquant = joueur}
                if (joueur.idJoueur==def){défenseur= joueur }
            }
        
            if (attaquant==null||défenseur==null){return false}

            if (attaquant.hasItem("Revolver_Des_Ténèbres")){return !this.zonesAdjacentes(parseInt(attaquant.position),parseInt(défenseur.position))}
            else{return this.zonesAdjacentes(parseInt(attaquant.position),parseInt(défenseur.position))}
        }

    existTarget(joueur){
        for (var j of this.joueurs){
            if (j.idJoueur!=joueur.idJoueur && this.canAttack(joueur.idJoueur,j.idJoueur)){return true}
        }
        return false
    }
    canSteal(id){
        for (var joueur of this.joueurs){
            if (joueur.idJoueur!=id && joueur.objets.length>0){return true}
        }
        return false
    }

    nextPlayer(){//Change le joueur courant au prochain dans la liste

    var indexCourant = 0;
    for (var j in this.joueurs){if (this.joueurs[j].idJoueur==this.joueurCourant){indexCourant=parseInt(j)}}
    
    if (indexCourant==this.joueursMax-1){
        this.joueurCourant=this.joueurs[0].idJoueur;
    }
    else{
        this.joueurCourant=this.joueurs[indexCourant+1].idJoueur
    }   
    
    }

    attaquer(atk,def){
        var attaquant = null;
        var défenseur = null;
        for (var joueur of this.joueurs){
            if (joueur.idJoueur==atk){attaquant = joueur}
            if (joueur.idJoueur==def){défenseur= joueur }
        }
        if (attaquant==null||défenseur==null){return null}
        var retour = {"dés":null,"dégâts":null,"lg":false}
        var d6 =  Math.floor(Math.random()*6)+1
        var d4 =  Math.floor(Math.random()*4)+1

        var baseDamage
        
        if (attaquant.hasItem("Sabre_Hanté_Masamune")||attaquant.character=="Valkyrie"){baseDamage = d4;retour.dés = [false,d4]}
        else{baseDamage = Math.abs(d6-d4);retour.dés = [d4,d6]}

        var totalDamage = baseDamage
        
        if (baseDamage>0){
            if (attaquant.hasItem("Hachoir_Maudit")){totalDamage++}
            if (attaquant.hasItem("Tronçonneuse_Du_Mal")){totalDamage++}
            if (attaquant.hasItem("Hache_Tueuse")){totalDamage++}
            if (attaquant.hasItem("Lance_De_Longinus" && this.hunters.includes(atk.character)) && attaquant.révélé){totalDamage+=2}
            if (attaquant.hasItem("Toge_Sainte")){totalDamage-=1}
        }

        if (attaquant.hasItem("Mitrailleuse_Funeste")){
            for (var défenseur of this.joueurs){
                var tempDamage = totalDamage
                if (this.canAttack(attaquant.idJoueur,défenseur.idJoueur && attaquant.idJoueur!=défenseur.idJoueur)){
            if (défenseur.protected==true){tempDamage=0}
            if (this.takeDamage(défenseur,tempDamage)==false){
                if (défenseur.character=="Loup-Garou"&&défenseur.révélé){this.state = "contre-attaque";this.variableTemp = défenseur.idJoueur;retour.lg=true}
            }
        }
    }
    retour.dégâts = totalDamage
    return retour
}
        else{

        if (défenseur.protected==true){totalDamage=0}
        retour.dégâts = totalDamage
  
        if (this.takeDamage(défenseur,totalDamage)==false){
            if (défenseur.character=="Loup-Garou"&&défenseur.révélé){this.state = "contre-attaque";this.variableTemp = défenseur.idJoueur;retour.lg=true}
        }
        
        return retour;
    }



    }


}
module.exports = { Game,Bataille,sixquiprend,shadowHunter }
