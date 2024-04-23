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
        newdata = {
            "nb_bots":self.nb_bots,
            "scores":self.scores,
            "winners": [str(winner) for winner in self.winners]
        }
        try:
            with open(filename, 'r+') as file:
                data = json.load(file)
                data.append(newdata)
                file.seek(0)
                json.dump(data, file, indent=4)
        except Exception:
            with open(filename, 'w') as file:
                json.dump([newdata], file, indent=4)
                
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

class BotRandomFakeVsTrueRandom(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotRandomFake(f"BotRandomFake {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotTrueRandom(f"BotTrueRandom {i}"))

# def generate_graphs(battle_name):
#         # quels types de graphiques ?
#         # graphs des types de parties avec type de strat
#         # courbe de score différente pour chaque type de strat
#         # courbe de winner différente pour chaque type de strat
#         filename = battle_name+".json"
#         with open(filename, 'r') as file:
#             data = json.load(file)
#             scores_min, scores_max, scores_random_fake, scores_true_random = [], [], [], []
#             winner_min, winner_max, winner_random_fake, winner_true_random = 0, 0, 0, 0
#             for game in data:
#                 for score in game["scores"]:
#                     if "BotMin" in score:
#                         scores_min.append(game["scores"][score])
#                     elif "BotMax" in score:
#                         scores_max.append(game["scores"][score])
#                     elif "BotRandomFake" in score:
#                         scores_random_fake.append(game["scores"][score])
#                     elif "BotTrueRandom" in score:
#                         scores_true_random.append(game["scores"][score])
#                 for winner in game["winners"]:
#                     if "BotMin" in winner:
#                         winner_min+=1
#                     elif "BotMax" in winner:
#                         winner_max+=1
#                     elif "BotRandomFake" in winner:
#                         winner_random_fake+=1
#                     elif "BotTrueRandom" in winner:
#                         winner_true_random+=1
#             if len(scores_min) > 0:
#                 plt.plot(scores_min, label="BotMin")
#             if len(scores_max) > 0:
#                 plt.plot(scores_max, label="BotMax")
#             if len(scores_random_fake) > 0:
#                 plt.plot(scores_random_fake, label="BotRandomFake")
#             if len(scores_true_random) > 0:
#                 plt.plot(scores_true_random, label="BotTrueRandom")
#             plt.legend()
#             plt.legend()
#             plt.savefig(battle_name+"_scores.png")
#             # new plot for winners
#             plt.clf()
#             if winner_random_fake > 0:
#                 plt.bar(["BotRandomFake", "BotTrueRandom"], [winner_random_fake, winner_true_random])
#             elif winner_min > 0:
#                 plt.bar(["BotMin", "BotMax"], [winner_min, winner_max])
#             # plt.bar(["BotMin", "BotMax"], [winner_min, winner_max])
#             plt.savefig(battle_name+"_winners.png")
#             print("Graph generated")


def stats(filename="game_stats.json"):
    # ajouter nb joueurs
    with open(filename, 'r') as file:
        strats = []
        data = json.load(file)
        scores0 = data[0]["scores"]
        for botname in scores0:
            sous_chaine = botname[:-2]
            if sous_chaine not in strats:
                strats.append(sous_chaine)
        scores = {}
        winners = {}
        for strat in strats:
            scores[strat] = []
            winners[strat] = 0
        for game in data:
            for botname in game["scores"]:
                sous_chaine = botname[:-2]
                scores[sous_chaine].append(game["scores"][botname])
            for winner in game["winners"]:
                sous_chaine = winner[:-2]
                winners[sous_chaine] += 1
    return scores, winners

def generate_graphs(scores, winners):
    for strat in scores:
        print(strat)
        plt.plot(scores[strat], label=strat)
    plt.legend()
    plt.title("Scores")
    plt.savefig("_".join(scores.keys())+"_scores.png")
    plt.clf()
    plt.bar(list(winners.keys()), list(winners.values())) 
    plt.title("Winners")
    plt.savefig("_".join(winners.keys())+"_winners.png")
    print("Graph generated")

if __name__ == "__main__":
    for i in range(10):
        testRandom = BotRandomFakeVsTrueRandom(nb_bots=10)
        testRandom.start_game()
        testRandom.save_game_stats("BotRandomFakeVsTrueRandom.json")
    scores, winners = stats("BotRandomFakeVsTrueRandom.json")
    generate_graphs(scores, winners)
    for i in range(100):
        testMinMax = BotMinVsMax(nb_bots=10)
        testMinMax.start_game()
        testMinMax.save_game_stats("BotMinMax.json")
    scores, winners = stats("BotMinMax.json")
    generate_graphs(scores, winners)