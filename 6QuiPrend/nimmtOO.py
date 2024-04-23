from players.humanPlayer import HumanPlayer
from players.Bot import BotRandomFake,BotTrueRandom, BotMin, BotMax, BotEchantillon,BotEchantillonMieux,BotMinMax
from random import randint
from game.nimmtGame import NimmtGame
from game.nimmtGameBot import *

def interactiveRun():
    print("Bienvenue sur le jeu 6 qui prend !")
    while True:
        try:
            num_players = int(input("Combien de joueurs ? "))
            players=[]
            for i in range(num_players):
                # name=input("Nom du joueur : ")
                
                
                players.append(BotMinMax("Bot "+str(i)))

            game=NimmtGame(players)
            scores, winners=game.play()

            print("La partie est terminée!")
            print("Scores finaux :")
            for playername, score in scores.items(): 
                print(f"Joueur {playername} : {score} points")
            s=" ".join([player.name for player in winners])
            print("Vainqueurs(s) : ",s," !")
            break
        except ValueError:
            print("Veuillez entrer un nombre entier.")




if __name__ == "__main__":
    interactiveRun()