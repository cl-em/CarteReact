import random

nb_lignes = 3  # Nombre de lignes
nb_colonnes = 3  # Nombre de colonnes

tableau = [[random.randint(0, 100) for _ in range(nb_colonnes)] for _ in range(nb_lignes)]

print(tableau)

print(min(min(tableau)))