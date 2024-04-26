from players.player import Player
from game.card import Card
from math import floor
from random import randint, choice,shuffle
from enum import Enum

class Bot(Player):
    def info(self,game):
        pass
        

    def getLineToRemove(self, game):
        """
        permet d'obtenir la ligne à enlever quand la carte jouée était plus petite

        :param game: le jeu en cours
        :return: la ligne à enlever
        """
        
        # itere dans toutes les lignes de games
        retour = 0
        index = 0
        for ligne in game.table : 
            if game.total_cows(ligne) < game.total_cows(game.table[retour]):
                retour = index
            index+=1

        return retour
    
    def player_turn(self, game):
        """
        Gère le tour de jeu d'un bot.

        :param game : le jeu en cours
        """


        return Card(self.getCardToPlay())

class BotRandomFake(Bot):
    def getCardToPlay(self):    
        """
        Permet d'obtenir la carte à jouer.
        Choisi une carte aléatoire en accord avec le paradigme random traité dans cette classe merci

        :return: La réponse du bot.
        """    
        
        return choice(self.hand).value

class BotTrueRandom(BotRandomFake): 
    def getLineToRemove(self, game):
        return randint(0,len(game.table)-1)
    

class BotMin(Bot):
    def getCardToPlay(self):
        res = self.hand[0].value
        for card in self.hand:
            if card.value < res:
                res = card.value
        return res

class BotMax(Bot):
    def getCardToPlay(self):
        res = self.hand[0].value
        for card in self.hand:
            if card.value > res:
                res = card.value
        return res
    


class BotEchantillonMieux(Bot):
   
    def player_turn(self, game):
        return Card(self.getCardToPlay(game))
    
    def getCardToPlay(self,game):
        scores = {}
        for i in self.hand:
            scores[i.value]=0

        #---------------------------------Obtention de la main et des cartes encore possibles--------------------
        main = []
        pasMain = []
       
        for i in self.hand:
            main.append(i.value)
        jouees = main.copy()
        for z in game.table:
            for zz in z:#z est une ligne, zz est une carte
                jouees.append(zz.value)
        for z in game.alreadyPlayedCards:
            jouees.append(z.value)
        for i in range(1,105):
            if i not in jouees:
                pasMain.append(i)
                
        lignesEval = []#Mise sous forme de tableau de nombres entiers des lignes de la game
        for z in game.table:
                    zz = []
                    for zzz in z:
                        zz.append(zzz.value)
                    lignesEval.append(zz)

        for carte in main:
            cartesRestantes = [j for j in main if j != carte]
            scoreDeLaCarte=0
            for t in range(50):#On évalue des échantillons
                pasMain2 = pasMain.copy()
                shuffle(pasMain2)
                lignesEvaluees=lignesEval.copy()
                descente = [carte]
                oaizrjoi = cartesRestantes.copy() # c'est quoi ça 
                shuffle(oaizrjoi)
                descente+=oaizrjoi#création d'une descente random
            
                descentesAutres = [[] for i in range(len(game.players)-1)]
                while len(pasMain2)>len(descentesAutres):    
                    for j in descentesAutres:
                        j.append(pasMain2.pop(0))

              

                
                
                #eval des descentes:
                tour = 0
                while tour<len(descente)-1:
                    cartesEval=[descente[tour]]
                    for a in range(len(game.players)-1):
                        cartesEval.append(descentesAutres[a][tour])
                    for cartee in cartesEval:#cartee car carte est déjà utilisé
                        #Jeu de chaque carte de façon optimale
                        cartePosable = False
                        for z in lignesEvaluees:
                        
                            if cartee>z[len(z)-1]:
                                cartePosable=True

                        if cartePosable:#Soit on pose la carte et on modifie la ligne en conséquence
                            ligneChoisie = 0
                            index = 0
                            for z in lignesEvaluees:
                                if abs(z[len(z)-1]-cartee)<abs(lignesEvaluees[ligneChoisie][len(lignesEvaluees[ligneChoisie])-1]-cartee):
                                    ligneChoisie=index
                                index+=1

                            if len(lignesEvaluees[ligneChoisie])>=5:#Cas où la carte termine la ligne
                                lignesEvaluees[ligneChoisie]=[cartee]
                                if cartee==descente[tour]:
                                        aj = 0 ##fix les scores
                                        for j in lignesEvaluees[ligneChoisie]:
                                            aj+=Card(j).cowsNb
                                        scoreDeLaCarte=aj
                                    
                            else:
                                lignesEvaluees[ligneChoisie].append(cartee)

                        else:#soit on prend la ligne
                            ligneChoisie = 0
                            index = 0
                            som=0
                            for zz in lignesEvaluees[0]:
                                    som+=Card(zz).cowsNb
                            for z in lignesEvaluees:
                                ts = 0
                                for zz in z:
                                    ts+=Card(zz).cowsNb
                                if ts<som:
                                    ligneChoisie=index
                                    som = ts
                                index+=1

                            if cartee==descente[tour]:
                                    aj = 0
                                    for j in lignesEvaluees[ligneChoisie]:
                                        aj+=Card(j).cowsNb
                                    scoreDeLaCarte=aj
                            lignesEvaluees[ligneChoisie]=[cartee]
                    tour+=1
            scores[carte]+=scoreDeLaCarte
        
          
        return min(scores, key=lambda k: scores[k])



class BotModéré(Bot):
    def getCardToPlay(self):
        return self.hand[floor(len(self.hand)/2)].value


class BotElouand(Bot):
    def player_turn(self, game):
        return Card(self.getCardToPlay(game))
      
    def getCardToPlay(self,game):
        peutJouer = False
        jouables = []
        for z in self.hand:
            index = 0
            for zz in game.table:
                for zzz in zz:
                    if zzz.value<z.value and len(zz)<5:
                        peutJouer=True
                        jouables.append(z)
                index+=1

        res = self.hand[0].value
        if peutJouer==True:
            res = jouables[0].value
            for z in jouables:
                if z.value<res:
                    res=z.value
            return res
        else:
            return self.hand[len(self.hand)-1].value





class BotFilou(Bot):
    def player_turn(self, game):
        return Card(self.getCardToPlay(game))
    
    def getCardToPlay(self,game):

        #test de la solution "Placement optimal"
        main = []
        for ca in self.hand:
            main.append(ca.valeur)

        for l in game.lignes:
            iNCROYABLEVALEUR = l[len(l)].valeur+5-len(l)
            if iNCROYABLEVALEUR in main:
                return iNCROYABLEVALEUR
            
        #Test de la solution "Avantage de départ"
        if (len(main)==10):
            return main[floor(len(main)/2)]##On considère la main triée évidemment


        #test de la solution "Bon débarras"
        #Pour faire simple si on ne peut pas jouer on verra s'il est possible de prendre une toute petite ligne en se débarrassant des cartes les plus faibles, sinon on continue

        if (len(main)<7 and len(main)>3)

        


