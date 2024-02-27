
class Carte {

constructor(valeur,couleur) {
this.valeur = valeur;
this.couleur = couleur;
}

}

class CarteShadowHunter extends Carte{
    constructor(valeur,type) {
        super(valeur,"")
        this.couleur = null
        this.type = type;
        }
}

module.exports = { Carte,CarteShadowHunter };