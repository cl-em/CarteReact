from players.humanPlayer import HumanPlayer
from players.Bot import BotRandomFake,BotTrueRandom, BotMin, BotMax, BotEchantillonMieux, BotModéré, BotElouand
from players.MinMax import BotMinMax
# from players.DeepLearningBot import DeepLearningBot
from game.nimmtGame import NimmtGame
import json
import matplotlib.pyplot as plt
from tqdm import tqdm
import threading
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

class BotEchantillonVsTrueRandom(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotEchantillonMieux(f"BotEchantillonMieux {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotTrueRandom(f"BotTrueRandom {i}"))

class TestAllBots(Tests):
    def __init__(self) -> None:
        super().__init__(7)
        self.players.append(BotTrueRandom(f"BotTrueRandom 0"))
        self.players.append(BotRandomFake(f"BotRandomFake 0"))
        self.players.append(BotMin(f"BotMin 0"))
        self.players.append(BotMax(f"BotMax 0"))
        self.players.append(BotEchantillonMieux(f"BotEchantillonMieux 0"))
        self.players.append(BotModéré(f"BotModéré 0"))
        self.players.append(BotElouand(f"BotElouand 0"))

class BotTrueRandomVsElouand(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotTrueRandom(f"BotTrueRandom {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotElouand(f"BotElouand {i}"))

class BotRandomFakeVsElouand(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotRandomFake(f"BotRandomFake {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotElouand(f"BotElouand {i}"))

class BotMinMaxVsElouand(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotElouand(f"BotElouand {i}"))

class BotMinMaxVsTrueRandom(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotTrueRandom(f"BotTrueRandom {i}"))
class BotMinMaxVsRandomFake(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotRandomFake(f"BotRandomFake {i}"))

class BotMinMaxVsEchantillonMieux(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotEchantillonMieux(f"BotEchantillonMieux {i}"))

class BotMinMaxVsModéré(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotModéré(f"BotModéré {i}"))

class BotMinMaxVsMin(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotMin(f"BotMin {i}"))
class BotMinMaxVsMax(Tests):
    def __init__(self, nb_bots) -> None:
        super().__init__(nb_bots)
        for i in range(nb_bots//2):
            self.players.append(BotMinMax(f"BotMinMax {i}"))
        for i in range(nb_bots//2):
            self.players.append(BotMax(f"BotMax {i}"))

def stats(filename="game_stats.json"):
    # ajouter nb joueurs
    with open(filename, 'r') as file:
        strats = []
        data = json.load(file)
        scores0 = data[0]["scores"]
        for botname in scores0:
            sous_chaine = botname
            if sous_chaine not in strats:
                strats.append(sous_chaine)
        scores = {}
        winners = {}
        for strat in strats:
            scores[strat] = []
            winners[strat] = 0
        for game in data:
            for botname in game["scores"]:
                sous_chaine = botname
                scores[sous_chaine].append(game["scores"][botname])
            for winner in game["winners"]:
                sous_chaine = winner
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
    winners = []
    for _ in tqdm(range(100)):
        bots = bot_type(nb_bots=2)
        bots.start_game()
        bots.save_game_stats(filename)
        score, winner = stats(filename)
        scores.append(score)
        winners.append(winner)
    generate_graphs(scores, winners)


class AllBots(Tests):
    def __init__(self, bots) -> None:
        super().__init__(len(bots))
        for b in bots:
            self.players.append(b)


if __name__ == "__main__":
    # for i in range(1):
    #     test = AllBots([BotRandomFake("random fake"),BotTrueRandom("random true"), BotMin("minn"), BotMax("max"), BotEchantillonMieux("echantillon"), BotModéré("modere"), BotElouand("elouand")])
    #     test.start_game()

    #     test.save_game_stats("toutTest/touslesbots.json" )

    #     print(i+1)

    scores,winners = stats("toutTest/touslesbots.json")
    generate_graphs(scores,winners)