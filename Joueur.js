const { Carte } = require('./Carte.js'); //Nécessaire pour la main.


class Joueur{

    //La classe joueur définit l'état d'un joueur dans une partie donnée

constructor(id,isHost,score){
    this.idJoueur = id; //Id du joueur, permettant de l'identifier lors d'une réception d'information par socket
    this.main = []; //Contenu de la main du joueur
    this.isHost = isHost; //Définit si le joueur est l'host de la partie ou non. Utile pour savoir si l'on peut lancer la partie    
    this.choix;
    this.éliminé = false;
    this.score = score;
    this.type="joueur"
}

static fromJSON(data){
    var joueur = new Joueur(data.idJoueur,data.isHost,data.score);
    joueur.main = data.main;
    return joueur;
}


setChoice(valeur,couleur){//Pour sauvegarder la carte utilisée et la retirer de la main
    if (this.choix!=null){return false;}
    for (var carte in this.main){
        if (this.main[carte].valeur==valeur && this.main[carte].couleur==couleur){
            this.choix = this.main[carte];
            this.main.splice(carte,1);
            return true;
        }
    }
    return false;
}

}

class JoueurShadowHunter extends Joueur{//Comme le shadow hunter a des règles bien différentes, il vaut mieux créer un joueur exprès

    constructor(id,isHost,character,hp){
        super(id,isHost)
        this.character = character
        this.hurtPoint = 0
        this.hp = hp 
        this.révélé = false
        this.pouvoirUtilisé = false
        this.protected = false
        this.turnsToPlay = 0
        this.objets = []; //Contenu de la main du joueur
        this.choix;
        this.éliminé = false;
        this.position = Math.floor(Math.random()*5);

    }

    hasItem(objet){//Permet de savoir si le joueur possède l'objet
        for (var test of this.objets){
            if (test==objet){return true}
        }
        return false
    }

    isDead(){//Pour savoir si un joueur est mort
        if (this.hurtPoint<this.hp){return false}
        return true
    }


}


class bot6QuiPrendRandom extends Joueur{//Classe représentant un bot random de six qui prend
    constructor(id,isHost){
        super(id,isHost)
        this.type="Bot"
    }
    setChoice(partie){
        if (this.choix!=null && this.choix!=undefined){return false;}
        if (partie.tourEnCours){return false}
        var carte = Math.floor(Math.random()*this.main.length)
        this.choix = this.main.splice(carte,1)[0];
  
        return true

    }

    takeLine(partie){
        var ligne = 0
        var scoreCourant = 100000
        var index = 0
        for (var l of partie.lignes){
            var score = 0
            for (var z of l){
                score+=z.valeur
            }
            if (score<scoreCourant){
                ligne=index
            }
            index++
        }
       
        partie.prendreLigne(this.idJoueur,ligne)

        return 
    }

}

class bot6QuiPrendElouand extends Joueur{//Bot plus avancé qui joue soit son maximum s'il ne peut pas jouer, soit son minimum s'il peut jouer
    constructor(id,isHost){
        super(id,isHost)
        this.type="Bot"
    }
    setChoice(partie){
        if (this.choix!=null && this.choix!=undefined){return false;}
        if (partie.tourEnCours){return false}
        var carte = 0
        var peutPoser = false
            for (var s in this.main){//On détermine la plus grosse carte
                if (this.main[s].valeur>this.main[carte].valeur){
                    carte = s
                }
            }


        for (var z of partie.lignes){//On vérifie si ladîte carte est jouable. Le test sur la longueur sert à ne pas prendre volontairement la ligne en mettant la dernière carte
            if (z[z.length-1].valeur<this.main[carte].valeur && z.length<5){
                peutPoser=true
            }
        }


        if (peutPoser){//On cherche à poser la plus petite carte
            for (var s in this.main){
                var posable = false
                for (var zzz of partie.lignes){
                    if (zzz[zzz.length-1].valeur<this.main[s].valeur){
                        posable = true
                    }
                }
                if (this.main[s].valeur<this.main[carte].valeur && posable){
                    carte = s
                }
            }
        }
        //Si on ne peut pas poser alors on tente de placer sa plus grosse carte pour augmenter les chances qu'un autre joueur prenne une ligne et nous laisse jouer
        //Comme on a déjà carte==max, pas besoin de faire plus de calculs

        this.choix = this.main.splice(carte,1)[0];
  
        return true

    }


    takeLine(partie){
        var ligne = 0
        var scoreCourant = 100000
        var index = 0
        for (var l of partie.lignes){
            var score = 0
            for (var z of l){
                score+=z.valeur
            }
            if (score<scoreCourant){
                ligne=index
            }
            index++
        }
       
        partie.prendreLigne(this.idJoueur,ligne)

        return 
    }
}

module.exports = { Joueur,JoueurShadowHunter,bot6QuiPrendElouand,bot6QuiPrendRandom };