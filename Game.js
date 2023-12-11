const { Carte } = require('./Carte.js');

class Game {

    constructor(couleurs,nbvaleurs,host/*host est de la classe globale "utilisateur" et crée une instance de la classe "joueur*/) {
        this.couleurs = couleurs;
        this.nbvaleurs = nbvaleurs;
        this.deck = [];//Représente les cartes présentes dans le deck utilisé par la partie
        this.joueurs = [];




    }


    createDeck(){
        for (var couleur of this.couleurs){
            for (var i=0;i<this.nbvaleurs;i++){
                this.deck.push(new Carte(i,couleur));
            }
        }
    }

    shuffleDeck(){
        this.deck = this.deck.sort((a, b) => 0.5 - Math.random());
    }

    drawCarte(){
       
        var retour = this.deck[0];
        this.deck.shift();
        return retour;
    }



}
module.exports = { Game };