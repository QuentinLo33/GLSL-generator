# Générateur de Shaders Procéduraux

Projet informatique individuel  
Quentin Lopez

## Description

Application web permettant de générer dynamiquement des **shaders procéduraux en GLSL** avec une **prévisualisation 3D en temps réel**.

L’utilisateur peut sélectionner un matériau, ajuster ses paramètres et observer instantanément le rendu appliqué sur différents modèles 3D.

### Technologies utilisées

- **HTML / CSS** — interface utilisateur
- **JavaScript** — logique applicative
- **GLSL** — génération des shaders
- **Three.js (WebGL)** — rendu 3D temps réel

Le système repose sur un **graphe de blocs procéduraux (nodes)** inspiré des _shader nodes_ de Blender, permettant de combiner différents motifs comme **Noise, Voronoi, Wave ou Magic Texture**.

Une **vidéo de démonstration** est disponible dans ce dépôt.

---

## Fonctionnalités

### Gestion des matériaux

- Sélection de matériaux par catégories : **métal, bois, tissu, minéral, synthétique**
- Sous-types prédéfinis (ex : bronze, marbre, bois brut…)
- Paramètres dynamiques générés automatiquement (couleur, rugosité,...)
- Mise à jour **en temps réel** du rendu et du shader GLSL

---

### Interaction 3D

- Rotation libre autour du modèle
- Zoom / dézoom à la molette
- Repère 3D interactif pour se repositionner rapidement

---

### Configuration de la scène

- Modification de la **couleur de fond**
- Choix du **modèle 3D**
- Réglage de l’**éclairage** (lumière ambiante)
- Gestion des **réflexions environnementales**

### Génération et export de shaders

- Visualisation en temps réel du code :
  - **vertex shader**
  - **fragment shader**
- Export des shaders :
  - fichiers séparés
  - ou version complète compilée

---

## Pré-requis

Installer **Node.js** (version LTS recommandée) :  
 https://nodejs.org

---

## Lancer le projet

1. Ouvrir le dossier dans **Visual Studio Code**
2. Installer les dépendances :

````bash
npm install
Lancer le serveur :
npm run dev
Ouvrir l’URL affichée (localhost) dans votre navigateur
 recommandé : Google Chrome
Aperçu du projet

Le système permet de générer des matériaux procéduraux complexes à partir d’un assemblage de blocs (patterns + opérateurs), transformés dynamiquement en code GLSL exécuté sur GPU.

---
## Pré-requis : Installer Node.js

Node.js est nécessaire pour gérer les dépendances et exécuter le serveur de développement.
Télécharge Node.js (version LTS recommandée) depuis le site officiel : [https://nodejs.org](https://nodejs.org)

## Exécuter le projet

1. Ouvrir le dossier du "GLSL_Generator_Code" dans **Visual Studio Code**
2. Installer les dépendances :

```bash
npm install
````

3. Lancer le serveur de développement :

```bash
npm run dev
```

4. Copier l’URL **localhost** affichée dans le terminal et l’ouvrir dans votre navigateur
   (de préférence **Google Chrome**).

---

## Dépannage (WebGL / affichage)

Si l’application ne s’affiche pas correctement (écran noir, erreurs WebGL), cela peut venir des paramètres du navigateur. Veuillez verifier vos extension en suivant la vidéo ci-dessous

[Extensions Chrome pour WebGL](https://www.google.com/search?q=extension+google+chrome+pour+webgl)
