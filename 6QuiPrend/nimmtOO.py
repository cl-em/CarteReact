from players.humanPlayer import HumanPlayer
from players.Bot import BotRandomFake,BotTrueRandom, BotMin, BotMax,BotEchantillonMieux,BotModéré,BotElouand
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
                r = randint(1,40)
                if (r<7):
                    name = "Bot Kylian (echantillonnage)"+str(i)
                    players.append(BotEchantillonMieux(name))
                else:
                    if (r<14):
                        name = "Bot Matox (true random)"+str(i)
                        players.append(BotTrueRandom(name))
                    else:
                        if (r<25):
                            name = "Bot Clément (modéré)"+str(i)
                            players.append(BotModéré(name))
                        else:
                            if (r<30):
                                name = "Bot Thibaud (max)"+str(i)
                                players.append(BotMax(name))
                            else:
                                name = "Bot Elouand (strat Elouand)"+str(i)
                                players.append(BotElouand(name))
                                

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