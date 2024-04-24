from game.nimmtGame import NimmtGame
from players.player import Player
from game.card import Card

from random import choice

class  ArbrePartie():
    def __init__(self,game:NimmtGame,carte:Card,joueur): 
        self.partie:NimmtGame=game
        self.fils= []
        self.carteJouer:Card=carte
        self.joueur = joueur

    def ajoutFils(self,fils):
        self.fils.append(fils)


    def update_table(self,plays:tuple): # nom joueur, carte
        partieF:NimmtGame = self.partie
        partieF.update_table(plays)
        
        carte=Card(0)
        for joueur,cartei in plays:
            if joueur.name==self.joueur.name:
                carte = cartei


        return ArbrePartie(partieF,carte,self.joueur)


def creerPossibilite(arbre:ArbrePartie,maMain,J1,mainAdversaire,J2,profondeur):
    if profondeur<=0 or maMain==[]:
        return True

    else :
        for carteMoi in maMain:
            for carteAdversaire in mainAdversaire:
                arbre.ajoutFils(arbre.update_table([(J1,carteMoi),(J2,carteAdversaire)]))

                #ici récursion


class  MinMaxZIZI(Player):
    def info(self,message):
        return message
    
    def player_turn(self,game):
        

        carte =self.getCardToPlay(game)
        return Card(carte)

    def getCardToPlay(self,game:NimmtGame):
        
        carteJouableEnnemi=[Card(i) for i in range(1,105)]

        ennemie = 0
        if len(game.players) != 2:
            raise  ValueError("pas bon nombre de joueurs")
            return
        else:
            for j in game.players:
                if j.name != self.name:
                    ennemie = j
            

        carteJouableEnnemi = game.players[game.players.index(ennemie)].hand

        possibilite = ArbrePartie(game,-1,self)


        creerPossibilite(possibilite,self.hand,self,carteJouableEnnemi,ennemie,2)

        toutesLesBoeufs=float("inf")
        boeufIdx=0
        
        for index,fils in enumerate(possibilite.fils):
            for joueur in fils.partie.players:
                if joueur.name==self.name :

                    if joueur.score < toutesLesBoeufs:
                        toutesLesBoeufs = joueur.score
                        boeufIdx=index
                    
        if len(self.hand)==0:
            return 0  
        else :
            return possibilite.fils[boeufIdx].carteJouer.value


    def getLineToRemove(self,game):
        return 1