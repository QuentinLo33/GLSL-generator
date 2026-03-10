# GLSL-generator\section{README}

\subsection{Description du projet}

Cette application web permet de générer dynamiquement des \textbf{shaders procéduraux en GLSL} avec une \textbf{prévisualisation 3D en temps réel}.  
L'utilisateur peut sélectionner un matériau de base, modifier ses paramètres et observer immédiatement le rendu appliqué à différents modèles 3D.

L'application repose sur les technologies suivantes :

\begin{itemize}
\item \textbf{HTML / CSS} pour l'interface utilisateur
\item \textbf{JavaScript} pour la logique de l'application
\item \textbf{GLSL} pour la génération des shaders
\item \textbf{Three.js} et \textbf{WebGL} pour le rendu 3D temps réel
\end{itemize}

Le système s'appuie sur des \textbf{blocs procéduraux} inspirés des \textit{shader nodes} de Blender permettant de combiner différents motifs comme le \textit{Noise}, le \textit{Voronoi}, le \textit{Wave} ou encore le \textit{Magic Texture}.

\subsection{Exécution du projet}

Pour exécuter l'application :

\begin{enumerate}
\item Ouvrir le dossier du projet dans \textbf{Visual Studio Code}
\item Installer les dépendances avec la commande :
\begin{verbatim}
npm install
\end{verbatim}

\item Lancer le serveur de développement :
\begin{verbatim}
npm run dev
\end{verbatim}

\item Copier le lien \texttt{localhost...} affiché dans le terminal et l'ouvrir dans un navigateur web (de préférence \textbf{Google Chrome}).
\end{enumerate}
