from players.player import Player
from game.card import Card
from random import randint, choice,shuffle

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
    


class BotEchantillon(Bot):
   
    def player_turn(self, game):
        return Card(self.getCardToPlay(game))
    
    def getCardToPlay(self,game):
        scores = {}
        for i in self.hand:
            scores[i.value]=0

        #---------------------------------Obtention du sous-ensemble des cartes non-utilisées--------------------
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
        
        for i in range(1,104):
            if i not in jouees:
                pasMain.append(i)
                
        lignesEval = []#Mise sous forme de tableau de nombres entiers des lignes de la game
        for z in game.table:
                    zz = []
                    for zzz in z:
                        zz.append(zzz.value)
                    lignesEval.append(zz)
        #On va faire 100 sous-ensembles et pour chacun calculer le nombre de têtes offertes par la carte
        for _ in range(1000):
#-------------------------------------UN SOUS-ENSEMBLE------------------------------------------------------------------
            cartesAutres = []#représente les autres cartes jouées par d'autres joueurs
            for i in range(len(game.players)-1):
                cartesAutres.append(randint(0,len(pasMain)-1))

            for carte in main:
#-----------------------un test avec une carte------------------------
                lignesEvaluees = lignesEval.copy()
                cartesEval = cartesAutres.copy()
                cartesEval.append(carte)
                list.sort(cartesEval)

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
                            if cartee==carte:
                                scores[carte]=scores[carte]+sum(lignesEvaluees[ligneChoisie])#Si c'est la carte du bot, alors cette carte gagne le score de ce cas de figure précis
                        else:
                            lignesEvaluees[ligneChoisie].append(cartee)

                    else:#soit on prend la ligne
                        ligneChoisie = 0
                        index = 0
                        for z in lignesEvaluees:
                            if sum(z)<sum(lignesEvaluees[ligneChoisie]):
                                ligneChoisie=index
                            index+=1

                        if cartee==carte:
                                scores[carte]=scores[carte]+sum(lignesEvaluees[ligneChoisie])#Si c'est la carte du bot, alors cette carte gagne le score de ce cas de figure précis
                        lignesEvaluees[ligneChoisie]=[cartee]
        

        return min(scores, key=lambda k: scores[k])
    


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
        for i in range(1,104):
            if i not in jouees:
                pasMain.append(i)
                
        lignesEval = []#Mise sous forme de tableau de nombres entiers des lignes de la game
        for z in game.table:
                    zz = []
                    for zzz in z:
                        zz.append(zzz.value)
                    lignesEval.append(zz)

        for carte in main:
            scoreDeLaCarte=0
            cartesRestantes = [j for j in main if j != carte]
            
            for t in range(10):#On évalue 10 échantillons
                lignesEvaluees=lignesEval.copy()
                descente = [carte]
                oaizrjoi = cartesRestantes.copy()
                shuffle(oaizrjoi)
                descente+=oaizrjoi#création d'une descente random
            
                descentesAutres = [[] for i in range(len(game.players)-1)]
                while len(pasMain)>len(descentesAutres):    
                    for j in descentesAutres:
                        j.append(pasMain.pop(0))

                print(len(descentesAutres))
              

                
                
                #eval des descentes:
                tour = 0
                while tour<len(descente)-1:
                    cartesEval=[descente[tour]]
                    for a in range(len(descentesAutres)):
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
                                    scoreDeLaCarte+=sum(lignesEvaluees[ligneChoisie])
                            else:
                                lignesEvaluees[ligneChoisie].append(cartee)

                        else:#soit on prend la ligne
                            ligneChoisie = 0
                            index = 0
                            for z in lignesEvaluees:
                                if sum(z)<sum(lignesEvaluees[ligneChoisie]):
                                    ligneChoisie=index
                                index+=1

                            if cartee==descente[tour]:
                                    scoreDeLaCarte+=sum(lignesEvaluees[ligneChoisie])#Si c'est la carte du bot, alors cette carte gagne le score de ce cas de figure précis
                            lignesEvaluees[ligneChoisie]=[cartee]
                    tour+=1
                scores[carte]+=scoreDeLaCarte
        
    
        return min(scores, key=lambda k: scores[k])



            
        





class BotMinMax(Bot):
    def getCardToPlay(self,game):
        
        minCarte = min(min(game.table))

        carteJouable = []
        for carte in self.hand:
            if carte > minCarte : 
                carteJouable.append(carte)

        if carteJouable==[]:
            index =0
            for ligne in game.table : 
                if game.total_cows(ligne) < game.total_cows(game.table[retour]):
                    retour = index
                index+=1


  