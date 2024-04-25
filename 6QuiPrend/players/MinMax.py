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

                
        for fils in arbre.fils :
            creerPossibilite(fils,maMain,J1,mainAdversaire,J2,profondeur-1)

def MinMax(arbre:ArbrePartie,profondeur:int,maxJoueur):
    if profondeur<=0 or arbre.fils==[]:

        
        for j in arbre.partie.players:
            if j.name != arbre.joueur.name:
                ennemie=j

        return (1,arbre.carteJouer,profondeur) if arbre.joueur.score<ennemie.score else (-1,arbre.carteJouer,profondeur)

    if  maxJoueur:
        valeur = (float("-inf"),Card(0),0)

        for fils in arbre.fils:
            mima = MinMax(fils,profondeur-1,False)
            valeur=(max(valeur[0],mima[0]),fils.carteJouer if profondeur > mima[2] else mima[1],profondeur) # mettre la jour la partie en fonction du fils joué
            # truple (1 ou -1, carte si la profondeur est la plus grande,profondeur)
            # 



    else:
        valeur = (float("inf"),Card(0),0)

        for fils in arbre.fils:
            mima = MinMax(fils,profondeur-1,True)

            valeur = (min(valeur[0],mima[0]),fils.carteJouer if profondeur > mima[2] else mima[1],profondeur)
    return valeur

class  BotMinMax(Player):
    def __init__(self, name) -> None:
        super().__init__(name)
        self.carte = Card(1)

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

        mima = MinMax(possibilite,2,True)

        self.carte = mima[1]



        if len(possibilite.fils)==0:
            return self.hand[0].value
        else :
            return mima[1].value


    def getLineToRemove(self,game):
        
        idxLigne = 0
        # game.update_table([(self,self.carte)])
        for index,ligne  in enumerate(game.table):
            if ligne[-1] == self.carte:
                idxLigne = index

        return idxLigne