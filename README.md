# LinkedIn2CV

## Contexte & Objectif

  La création et la mise à jour d’un CV professionnel peuvent être longues et sujettes à des incohérences, notamment lorsque les informations ne sont pas alignées avec le profil LinkedIn de l’utilisateur.
Le projet **LinkedIn2CV** vise à automatiser ce processus en permettant la génération d’un CV au format PDF à partir des données LinkedIn d’un utilisateur.
  L’objectif est de fournir une application web intuitive et rapide, offrant plusieurs modèles de CV personnalisables et garantissant la cohérence entre les données LinkedIn et le document final.
  
---

## Fonctionnalités du système

Le système **LinkedIn2CV** doit permettre à l’utilisateur de :

1. **Authentification et gestion de profil**
   - Se connecter ou créer un compte utilisateur de manière sécurisée.
   - Insérer le lien de son profil LinkedIn ou importer un fichier d’export LinkedIn (.json).
   - Synchroniser automatiquement les informations de son profil LinkedIn.
   - Authentification Google ou Apple.

2. **Gestion des informations personnelles**
   - Récupérer et afficher les informations personnelles (nom, prénom, photo, contact, titre professionnel).
   - Récupérer et afficher les expériences professionnelles (poste, entreprise, période, description).
   - Récupérer et afficher les formations (établissements, diplômes, dates).
   - Récupérer les compétences, langues, et certifications du profil LinkedIn.

3. **Personnalisation du CV**
   - Modifier ou compléter les informations importées via un formulaire dynamique.
   - Ajouter manuellement de nouvelles expériences, formations ou compétences.
   - Choisir un modèle de CV (template) parmi plusieurs styles disponibles.
   - Personnaliser le design du CV (couleurs, polices, mise en page).

4. **Génération et gestion des CV**
   - Générer automatiquement un CV au format PDF à partir des informations saisies.
   - Télécharger ou imprimer le CV généré.
   - Sauvegarder plusieurs CV dans le compte utilisateur.
   - Mettre à jour un CV existant.

5. **Consultation et historique**
   - Accéder à la liste de tous les CV déjà créés.
   - Visualiser, modifier ou supprimer un CV existant.
   - Consulter la date de création et de dernière mise à jour de chaque CV.

6. **Administration et maintenance**
   - Ajouter ou mettre à jour les templates de CV par les administrateurs.
   - Gérer les erreurs de parsing ou d’import (fichier invalide, données manquantes, etc.).

---

##  Fonctionnalités futures
-  Mise à jour automatique du CV à chaque changement sur LinkedIn.  
-  Support multi-langues (FR / EN).  
-  Suggestions automatiques d’amélioration de CV basées sur l’IA.  
-  Exportation vers d’autres formats (DOCX, HTML).
  
---

## Stack technique

| Composant | Technologie |
|------------|--------------|
| **Backend** | Fastify |
| **Base de données** | PostgreSQL |
| **Frontend** | VueJS + Bootstrap |
| **Génération PDF** | Puppeteer |
| **Conteneurisation** | Docker / Docker Compose |
| **Contrôle de version** | GitHub |
| **CI/CD** | GitHub Actions |
| **Déploiement** | Google Cloud Platform |
| **Tests** | Jest (test unitaires), swagger |

---

## Couverture de tests
- **Tests unitaires** : vérification du parsing JSON, de la validation des données et des conversions PDF.  
- **Tests d’intégration** : vérification du workflow complet (import → affichage → génération PDF).  
- **Tests frontend** : validation des formulaires et de la prévisualisation du CV.  
- **Objectif de couverture** :  
  - 50 % minimum à la première livraison (21 novembre 2025)  
  - 70 % minimum à la version finale (19 décembre 2025)  

---

## Organisation de l’équipe

| Nom | Rôle | Responsabilités principales |
|------|------|-----------------------------|
| **Manel GOUDJIL** | Cheffe de projet / Frontend Developer | Gestion de projet, coordination de l’équipe, développement frontend avec Vue.js, UI/UX. |
| **Lan NGUYEN HONG** | Frontend Developer | UI/UX, développement de l’interface utilisateur avec Vue.js, intégration des composants et communication avec le backend. |
| **Mamy MENDES** | Frontend Developer | UI/UX, développement de l’interface utilisateur avec Vue.js, intégration des composants et communication avec le backend. |
| **Sofiane YEKENE** | Backend Developer | Développement des fonctionnalités backend (Fastify), gestion de l’API. |
| **Noah TOMBEZE** | Backend Developer / QA – Testeur | Développement des fonctionnalités backend, rédaction et exécution des tests unitaires et fonctionnels backend. |
| **Elisabeth GNIMASSOU** | Full Stack Developer | Développement des fonctionnalités backend, et intégration front-end/back-end.|

---

## Planification du projet

La planification du projet **LinkedIn2CV** est organisée en trois grandes phases :


### Phase 1 : Conception & Prototype (jusqu’au 24 Octobre 2025)

**Objectifs :**
- Finaliser la conception fonctionnelle et technique (maquettes, architecture, schéma de base de données).  
- Développer un prototype fonctionnel des principales interfaces utilisateur.  
- Mettre en place l’environnement de développement (GitHub, CI/CD, Docker, PostgreSQL).  
- Rédiger la documentation technique initiale.

**Livrables :**
- Maquettes validées (Figma).  
- README.md : Documentation du projet.  
- Cahier de recettes.  
- Documentation technique initiale.
  

### Phase 2 : Développement complet & Première livraison (jusqu’au 21 Novembre 2025)

**Objectifs :**
- Implémenter les principales fonctionnalités :
  - Authentification et gestion de profil.  
  - Import et parsing du profil LinkedIn (.json ou URL).  
  - Affichage des données utilisateur (expériences, formations, compétences, etc.).  
  - Génération du CV au format PDF via Puppeteer.  
- Mettre en place les tests unitaires et d’intégration (objectif : 50 % de couverture).  
- Réaliser la première validation client.

**Livrables :**
- Application complète et fonctionnelle.  
- CI/CD automatisée avec GitHub Actions.  
- Documentation mise à jour (technique et utilisateur).  
- Cahier de recettes mis à jour.  



### Phase 3 : Optimisation, stabilisation et déploiement (jusqu’au 19 Décembre 2025)

**Objectifs :**
- Corriger les bugs identifiés lors des tests et retours client.  
- Optimiser les performances du rendu PDF et de l’import LinkedIn.  
- Finaliser la personnalisation des templates de CV.  
- Renforcer les tests automatisés (objectif : 70 % de couverture).  
- Déployer la version finale sur Google Cloud Platform.

**Livrables :**
- Version stable et optimisée de l’application.  
- Documentation finale (technique et d’exploitation).  
- Version en ligne prête à l’utilisation.

---

### Suivi et coordination

- **Réunions d’équipe hebdomadaires (chaque séance PDL)** pour le suivi d’avancement et la répartition des tâches.  
- **Communication et échanges quotidiens via un serveur Discord**, avec des salons dédiés pour la conception, le front-end et le back-end.

---

## Maquettes & Prototype

Les maquettes du projet ont été réalisées sur **Figma**.  
  > [Voir le prototype sur Figma](https://www.figma.com/design/uEhSjMNZBFzFAxwjInUk64/LinkedIn2CV?node-id=7-2&t=SPE8bve7vPDgbimy-1)

Le prototype illustre le parcours utilisateur complet :
- Page d’accueil et authentification
- Import du profil LinkedIn
- Interface de personnalisation du CV
- Prévisualisation et téléchargement du CV au format PDF
  
---

## Documentation technique

La documentation technique, incluant les diagrammes et schémas illustrant la structure et le fonctionnement du système, est disponible dans le fichier **DESIGN.md**.

> **Remarque :** Les instructions détaillées pour installer et lancer le projet sont disponibles dans chaque dépôt :
- Frontend : `install.md` dans le repo frontend  
- Backend : `install.md` dans le repo backend


---

## Cahier de recette

Le cahier de recette, détaillant les scénarios de test et les vérifications nécessaires pour valider les fonctionnalités du projet, est disponible dans le fichier **RECETTE.md**.

---
