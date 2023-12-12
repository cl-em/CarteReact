const { Carte } = require('./Carte.js'); //Nécessaire pour la main.


class Joueur{

    //La classe joueur définit l'état d'un joueur dans une partie donnée

constructor(id,isHost){
    this.idJoueur = id; //Id du joueur, permettant de l'identifier lors d'une réception d'information par socket
    this.main = []; //Contenu de la main du joueur
    this.isHost = isHost; //Définit si le joueur est l'host de la partie ou non. Utile pour savoir si l'on peut lancer la partie    
    this.choix;
    this.éliminé = false;
}


setChoice(valeur,couleur){//Pour sauvegarder la carte utilisée et la retirer de la main
    for (var carte in this.main){
        if (this.main[carte].valeur==valeur && this.main[carte].couleur==couleur){
            this.choix = this.main[carte];
            this.main.splice(carte,1)
        }
    }
}








}
module.exports = { Joueur };