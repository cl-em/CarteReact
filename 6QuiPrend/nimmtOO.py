from players.humanPlayer import HumanPlayer
from players.Bot import *
from random import randint
from game.nimmtGame import NimmtGame


from players.MinMax import MinMaxZIZI

def interactiveRun():
    print("Bienvenue sur le jeu 6 qui prend !")
    num_players = int(input("Combien de joueurs ? "))
    players=[]

    players.append(MinMaxZIZI("bot 1"))
    players.append(MinMaxZIZI("bot 2"))


    game=NimmtGame(players)
    scores, winners=game.play()

    print("La partie est terminée!")
    print("Scores finaux :")
    for playername, score in scores.items(): 
        print(f"Joueur {playername} : {score} points")
    s=" ".join([player.name for player in winners])
    print("Vainqueurs(s) : ",s," !")



if __name__ == "__main__":
    interactiveRun()