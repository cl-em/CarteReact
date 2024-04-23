from players.humanPlayer import HumanPlayer
from players.Bot import BotRandomFake,BotTrueRandom, BotMin, BotMax
from game.nimmtGame import NimmtGame
import json
import matplotlib.pyplot as plt

class Tests():
    def __init__(self, nb_bots) -> None:
        self.nb_bots = nb_bots
        self.players = []
    def start_game(self):
        self.game=NimmtGame(self.players)
        self.scores, self.winners=self.game.play()
    def save_game_stats(self, filename="game_stats.json"):
        # stocker dans un json les infos suivantes: 
        # le type de strategie, via la sous-classe ?
        # le nombre de joueurs
        # la nature des adversaires, via le nom des players ?
        # le score des joueurs
        # les gagnants
        data = {
            "nb_bots":self.nb_bots,
            "players":str(self.players),
            "scores":str(self.scores),
            "winners":str(self.winners)
        }
        with open(filename, "w") as f:
            f.write(json.dumps(data))

    def generate_graphs(self):
        # quels types de graphiques ?
        # graphs des types de parties avec type de strat
        # courbe de score différente pour chaque type de strat
        # courbe de winner différente pour chaque type de strat
        plt.plot(self.nb_bots)
        plt.title("Nb Bots")
        plt.savefig("nb_bots.png")
class TestsRandomFake(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots):
            self.players.append(BotRandomFake(f"BotRandomFake {i}"))
        
class TestsTrueRandom(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots):
            self.players.append(BotTrueRandom(f"BotTrueRandom {i}"))

class TestsBotMin(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots):
            self.players.append(BotMin(f"BotMin {i}"))

class TestsBotMax(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots):
            self.players.append(BotMax(f"BotMax {i}"))

class BotMinVsMax(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMin(f"BotMin {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotMax(f"BotMax {i}"))

if __name__ == "__main__":
    for i in range(10):
        testRandom = BotMinVsMax(nb_bots=10)
        testRandom.start_game()
        # testRandom.save_game_stats("BotMinVsMax.json")
        testRandom.generate_graphs()