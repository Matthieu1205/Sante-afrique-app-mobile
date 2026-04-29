# Plan d'Implémentation — Application Mobile Santé Afrique
> **Données lues en direct sur santeafrique.net le 27 avril 2026**
> Sources : santeafrique.net · Design Figma "Mobile-sante-afrique" · App de référence Jeune Afrique (10 écrans analysés — audit complet feature par feature)

---

## Résumé exécutif

| Indicateur | Valeur |
|---|---|
| Durée MVP | **10 semaines** |
| Durée projet complet | **20 semaines (5 mois)** |
| Rubriques réelles à intégrer | **11 rubriques** |
| Formules d'abonnement | **3 (15k / 60k / 90k FCFA/an)** |
| Numéro magazine actuel | **N°23 (15 fév. 2026)** |
| Plateformes | **iOS + Android** |
| Framework | **React Native (Expo)** |

---

## 1. Contenu réel du site santeafrique.net

### 1.1 Les 11 rubriques (navigation principale de l'app)

| Rubrique | URL | Icône app |
|---|---|---|
| Actualités | /rubriques/actualites | 📰 |
| Conseils Pratiques | /rubriques/conseils-pratiques | 💡 |
| Dossier | /rubriques/dossier | 📋 |
| Équité & Accès aux produits de santé | /rubriques/equite-acces-produits-sante | ⚖️ |
| Les ODD | /rubriques/les-odd | 🌍 |
| Business Santé | /rubriques/business-sante | 💼 |
| Santé Mentale | /rubriques/bien-etre-mental | 🧠 |
| One Health | /rubriques/one-health | 🌿 |
| Santé & Nutrition Infantile | /rubriques/sante-nutrition-infantile | 🍼 |
| Santé Maternelle | /rubriques/sante-maternelle | 🤱 |
| Vaccination | /rubriques/vaccination | 💉 |

### 1.2 Types de contenu

- **Articles** — actualités santé Afrique de l'Ouest
- **Grand Entretien** — interviews avec professionnels de santé (format spécial)
- **Dossiers thématiques** — analyses approfondies
- **Tribunes** — opinions d'experts
- **Vidéos** — interviews, conseils pratiques, décryptages
- **Magazine numérique** — 6 numéros/an (N°17 à N°23 disponibles)
- **Les plus lus** — classement top 9 articles

### 1.3 Sections supplémentaires

- **Offres d'emploi** — secteur santé (/offres-emploi)
- **Espace Partenaires** — B2B (/partenaires)
- **Connexion/Abonnement** — (/connexion, /abonnement)

### 1.4 Recherche (placeholder réel du site)

> "Rechercher un article, un thème, un auteur…"

---

## 2. Les 3 formules d'abonnement réelles

| Formule | Prix annuel | Prix mensuel | Inclus |
|---|---|---|---|
| ⭐ **Premium Annuel** | 90 000 FCFA/an | ≈ 7 500 FCFA/mois | Site intégral + magazine papier + livraison |
| **Papier + Numérique** | 60 000 FCFA/an | ≈ 5 000 FCFA/mois | Magazine papier + accès site |
| **Numérique Annuel** | 15 000 FCFA/an | ≈ 1 250 FCFA/mois | Édition numérique + archives |

> **Contact service client :** infos@santeafrique.net · +225 07 14 56 50 76 · Lun–Ven 9h–18h (GMT)

---

## 3. Stack Technologique

| Couche | Technologie | Justification |
|---|---|---|
| Framework Mobile | React Native + Expo | iOS & Android depuis 1 codebase |
| Backend / API | WordPress REST API (santeafrique.net) | Connexion directe au site existant |
| Endpoints clés | GET /wp-json/wp/v2/posts, /categories, /tags | Articles, rubriques, filtres |
| Authentification | JWT + OAuth 2.0 | Google, Facebook, email/mdp |
| Notifications Push | Firebase Cloud Messaging | Alertes santé, nouveaux articles |
| Paiement FCFA | CinetPay + Wave | Orange Money, MTN Mobile Money |
| Cache offline | SQLite + AsyncStorage | Mode 3G/EDGE, hors connexion |
| Analytics | Firebase Analytics + Sentry | Comportement + crashes |
| État global | Zustand + React Query | Cache API, synchro état |
| CI/CD | GitHub Actions + EAS Build | Builds iOS/Android automatisés |

---

## 4. Les 20 Écrans de l'Application

### Phase MVP (Semaines 1–10) — 10 écrans
1. **Splash + Onboarding** — 3 slides + sélection pays
2. **Accueil — À la Une** — Hero slider 4 articles + feed + "Les plus lus" (top 9)
3. **11 Rubriques** — Liste et filtrage par catégorie
4. **Lecteur Article** — HTML rendu + images + bookmark + partage
5. **Grand Entretien** — Format interview spécial
6. **Recherche** — Full-text "article, thème, auteur…"
7. **Connexion / Inscription** — Email + JWT + OAuth
8. **Favoris + Historique** — Articles sauvegardés / lus
9. **Notifications Push** — Alertes santé, breaking news
10. **Mode Hors Ligne** — Cache SQLite 50 articles

### Phase Avancée (Semaines 11–16) — 10 écrans supplémentaires
11. **Kiosque Magazine** — N°23 en une + archives N°17–22
12. **Lecteur Magazine** — PDF numérique, sommaire + extrait
13. **Abonnement** — 3 formules : 15k / 60k / 90k FCFA/an
14. **Vidéos** — Interviews, conseils, décryptages
15. **Offres d'emploi** — Secteur santé
16. **Espace Partenaires** — B2B
17. **Tribunes** — Opinions d'experts
18. **Paramètres** — Thème, notifs, pays, abonnement
19. **Les plus lus** — Classement interactif
20. **Filtre par pays** — CI, CM, SN, BF, TG, BJ…

---

## 5. Phases d'Implémentation

### Phase 1 — Foundation (Semaines 1–4)
- Setup React Native + Expo (TypeScript) + ESLint + Prettier
- Connexion WordPress REST API : `GET /wp-json/wp/v2/posts`, `/categories`
- Navigation Bottom Tab Bar 5 onglets (inspiré Jeune Afrique)
- Design system depuis le Figma : couleurs vertes Santé Afrique, typographie
- Authentification email/mot de passe + JWT (`/connexion`)
- Splash screen + Onboarding 3 slides + sélection pays
- CI/CD : GitHub Actions + EAS Build
- Gestion d'état : Zustand + React Query

**✅ Livrable : Squelette navigable avec auth fonctionnelle**

---

### Phase 2 — Core Content / MVP (Semaines 5–10)
- Accueil : hero slider 4 articles (comme le site) + "Articles à la une" + "Les plus lus" top 9
- 11 rubriques réelles avec filtrage API
- Lecteur article : HTML rendu, images, metadata (auteur, date, rubrique)
- Format "Grand Entretien" — mise en page spéciale
- Recherche full-text : "article, thème, auteur…"
- Favoris et Historique (local + synchronisé)
- Notifications push Firebase
- Mode hors-ligne SQLite
- Section Vidéos

**✅ Livrable : MVP complet publiable en beta fermée**

---

### Phase 3 — Fonctionnalités Avancées (Semaines 11–16)
- Kiosque Magazine : N°23 en une + archives N°17 à N°22
- Lecteur magazine numérique : sommaire + extrait + accès abonnés
- Écran Abonnement avec 3 formules réelles (15k / 60k / 90k FCFA/an)
- Paiement CinetPay + Wave + Orange Money (prix en FCFA)
- Section Offres d'emploi santé
- Espace Partenaires B2B
- Tribunes avec signature auteur
- Deep links pour partage WhatsApp/SMS
- Profil : abonnement actif, factures

---

### Phase 4 — Finitions & Lancement (Semaines 17–20)
- Tests utilisateurs terrain (Abidjan, Dakar, Douala)
- Optimisation : images WebP, lazy loading, pagination infinie
- APK final < 30 Mo — compatible appareils 2 Go RAM
- Publication Google Play Store + Apple App Store
- Screenshots, icône, description FR/EN
- Monitoring Sentry + Firebase Analytics
- Contact support intégré : infos@santeafrique.net / +225 07 14 56 50 76
- Lancement beta → publication officielle

---

## 6. Timeline

```
Semaine:  1   2   3   4 | 5   6   7   8   9  10 | 11  12  13  14  15  16 | 17  18  19  20
          [--- Phase 1 --][---------  Phase 2 MVP  --------][---- Phase 3 -----][-- Phase 4 --]
                                                  ↑ MVP S10                         ↑ Launch S20
```

---

## 7. Contraintes Marché Africain

| Contrainte | Solution technique |
|---|---|
| Connexion lente (3G/EDGE) | Cache SQLite + images WebP compressées |
| Appareils entrée de gamme | APK < 30 Mo, Hermes engine, compatibilité 2 Go RAM |
| Paiement sans carte bancaire | CinetPay, Wave, Orange Money, MTN — prix en FCFA |
| Usage en extérieur (soleil) | Mode clair haute lisibilité + mode sombre |
| Support client local | Contact réel intégré : +225 07 14 56 50 76 |
| Sujets santé locaux | Paludisme, cancer col, nutrition infantile — sujets à fort engagement |

---

## 8. Équipe Recommandée

| Rôle | Profil | Implication |
|---|---|---|
| Dev Mobile | 2 × React Native (TypeScript) | Temps plein |
| Dev Backend | 1 × WordPress/API | Mi-temps |
| Designer UI/UX | 1 × (Figma existant → intégration) | Mi-temps |
| QA | 1 × testeur fonctionnel | Mi-temps |

---

## 9. Insights tirés de l'App Jeune Afrique (10 écrans analysés)

| Pattern UX Jeune Afrique | Adaptation Santé Afrique |
|---|---|
| Bottom tab bar 5 onglets | Accueil / Rubriques / Magazine / Mon Espace / Menu |
| Hero article pleine largeur | Article santé phare + slider 4 items |
| Onglets "À la Une" / "Tous les articles" | "À la Une" / "Les plus lus" |
| Icône audio sur chaque article | Lecture vocale des articles (TTS) |
| Icône bookmark rapide | Favoris sans connexion requise |
| Filtre par pays avec drapeaux | CI, CM, SN, BF, TG, BJ |
| Kiosque magazine avec numéros datés | Magazine N°23 + archives N°17–22 |
| Mon JA : Pour vous / Favoris / Historique | Mon Espace : Recommandés / Favoris / Historique |
| Écran connexion sobre | Email + mdp + illustration Santé Afrique |
| Rating in-app | Avis utilisateurs intégré au scroll |

---

---

## 10. Audit complet Jeune Afrique — 6 fonctionnalités ajoutées au plan

Après analyse croisée des 10 captures de l'app Jeune Afrique, 6 fonctionnalités absentes du plan initial ont été identifiées et intégrées :

### ❌ → ✅ Fonctionnalités ajoutées

| # | Fonctionnalité | Écran concerné | Implémentation |
|---|---|---|---|
| 1 | **Bloc "Contenu Partenaire"** | Feed Accueil | Composant `SponsoredCard` inséré toutes les 5 cartes — badge distinctif + logo sponsor |
| 2 | **Widget Notation In-App ★★★★★** | Feed Accueil | `RatingWidget` déclenché après 10 articles lus — 5 étoiles + "Envoyer ma note" |
| 3 | **Badges Format d'Article** | Liste articles | `ArticleTypeBadge` coloré : GRAND ENTRETIEN / LE DÉBAT / DOSSIER SPÉCIAL / TRIBUNE |
| 4 | **4 Raccourcis en haut du Menu** | Menu | Row d'icônes : "Se connecter" / "Préférences" / "Alertes" / "Magazine" |
| 5 | **Écran "Mon compte" portail** | Avant login | `AccountGatewayScreen` : message d'accueil + "J'ai déjà un compte" + "Je m'abonne" |
| 6 | **Magazine : sous-types + "Mes éditions"** | Magazine | 3 onglets (Magazine / Dossiers Spéciaux / Guides Santé) + onglet "Mes éditions" |

### ✅ Les 16 fonctionnalités déjà couvertes (confirmées)

Hero article pleine largeur · Onglets "À la une" / "Tous les articles" · Icône audio 🔊 · Icône bookmark 🔖 · Label catégorie · Bottom Tab Bar 5 onglets · Recherche header + menu · Cloche notifications · Catégories dans le Menu · Filtre pays avec drapeaux · Connexion email/mot de passe · Mot de passe oublié · Kiosque magazine + archives · Fiche numéro (Acheter/Sommaire/Extrait) · Mon Espace : Pour vous / Favoris / Historique · État vide illustré + CTA abonnement

---

*Document généré le 27 avril 2026 · Données lues en direct sur santeafrique.net*
*Audit Jeune Afrique : 22 fonctionnalités analysées · 16 couvertes · 6 ajoutées · 3 précisées*
*Contact éditorial : infos@santeafrique.net · +225 07 14 56 50 76*
