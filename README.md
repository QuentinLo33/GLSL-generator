# Générateur de Shaders Procéduraux

Projet informatique individuel
Quentin Lopez

## Description

Application web permettant de générer dynamiquement des **shaders procéduraux en GLSL** avec une **prévisualisation 3D en temps réel**.
L’utilisateur peut sélectionner un matériau de base, modifier ses paramètres et observer immédiatement le rendu appliqué sur des modèles 3D.

L’application est construite avec :

- **HTML / CSS** pour l’interface
- **JavaScript** pour la logique
- **GLSL** pour la génération des shaders
- **Three.js (WebGL)** pour le rendu 3D en temps réel

Le système repose sur des **blocs procéduraux (nodes)** inspirés des _shader nodes_ de Blender, permettant de combiner différents motifs tels que **Noise, Voronoi, Wave et Magic Texture** afin de générer des matériaux procéduraux.

Une **vidéo de démonstration de la version actuelle du projet** est également disponible dans ce dépôt.

## Pré-requis : Installer Node.js

Node.js est nécessaire pour gérer les dépendances et exécuter le serveur de développement.
Télécharge Node.js (version LTS recommandée) depuis le site officiel : [https://nodejs.org](https://nodejs.org)  

## Exécuter le projet

1. Ouvrir le dossier du "GLSL_Generator_Code" dans **Visual Studio Code**
2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur de développement :

```bash
npm run dev
```

4. Copier l’URL **localhost** affichée dans le terminal et l’ouvrir dans votre navigateur
   (de préférence **Google Chrome**).