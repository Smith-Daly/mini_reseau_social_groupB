# Groupe B — Mini Réseau Social (Posts & Commentaires)

Projet CRUD React/Next.js + FastAPI, conforme au cahier des charges.

## Structure

```
groupe_b/
├── backend/                        # API FastAPI + SQLAlchemy + SQLite
│   ├── main.py                     # Création de l'app, CORS, montage des routers
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── post_routes.py        # Endpoints /posts (+ commentaires d'un post)
│   │   │       └── commentaire_routes.py # Endpoints /commentaires/{id}
│   │   ├── db/
│   │   │   ├── dependencies.py     # Connexion SQLite, Base, get_db()
│   │   │   └── models.py           # Modèles Post, Commentaire
│   │   └── validation.py           # Schémas Pydantic (validation champs vides incluse)
│   ├── alembic/                    # Migrations de la base de données
│   │   ├── env.py                  # Config Alembic (utilise Base.metadata + l'URL de l'app)
│   │   └── versions/                # Historique des migrations
│   ├── alembic.ini
│   └── requirements.txt
└── frontend/                       # Next.js + Tailwind CSS
    └── app/
        ├── page.tsx           # Fil d'actualité (création/édition/suppression de posts)
        ├── posts/[id]/page.tsx # Détail post + commentaires
        └── lib/api.ts          # Appels vers l'API
```


## 1. Lancer le backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head            # applique les migrations (crée reseau_social.db)
uvicorn main:app --reload --port 8000
```

- API disponible sur : http://localhost:8000
- Documentation interactive (Swagger) : http://localhost:8000/docs
- La structure de la base SQLite (`reseau_social.db`) est gérée par **Alembic**, pas par un `create_all()` automatique : il faut lancer `alembic upgrade head` avant le premier démarrage.

### Migrations (Alembic)

Après toute modification de `app/db/models.py`, générer puis appliquer une migration :

```bash
cd backend
alembic revision --autogenerate -m "description du changement"
alembic upgrade head
```

Autres commandes utiles :

```bash
alembic current          # version actuellement appliquée
alembic history           # historique des migrations
alembic downgrade -1      # revenir à la migration précédente
```

Toujours relire le fichier généré dans `alembic/versions/` avant de l'appliquer : l'autogénération ne détecte pas tout (renommages de colonnes, certains changements de type SQLite, etc.).

## 2. Lancer le frontend

Dans un **autre terminal** :

```bash
cd frontend
npm install
npm run dev
```

- Application disponible sur : http://localhost:3000
- `.env.local` n'est pas versionné (voir `.gitignore`). Copie `.env.example` vers `.env.local` si le fichier n'existe pas déjà :
  ```bash
  cp .env.example .env.local
  ```
  Il pointe par défaut vers `http://localhost:8000` (URL de l'API).

## 3. Endpoints disponibles

| Méthode | Route                          | Description                          |
|---------|---------------------------------|---------------------------------------|
| GET     | /posts                          | Liste des posts + compteur commentaires |
| GET     | /posts/{id}                     | Détail d'un post + ses commentaires  |
| POST    | /posts                          | Créer un post                        |
| PUT     | /posts/{id}                     | Modifier un post                     |
| DELETE  | /posts/{id}                     | Supprimer un post (cascade commentaires) |
| GET     | /posts/{id}/commentaires        | Liste des commentaires d'un post     |
| POST    | /posts/{id}/commentaires        | Ajouter un commentaire               |
| PUT     | /commentaires/{id}              | Modifier un commentaire              |
| DELETE  | /commentaires/{id}              | Supprimer un commentaire             |

## 4. Points couverts (cahier des charges)

-  CRUD complet posts + commentaires
-  Fil d'actualité trié du plus récent au plus ancien
-  Compteur de commentaires exact par post (calculé côté SQL, testé)
-  Interface simple, responsive (Tailwind CSS)
-  Gestion des erreurs : champs vides refusés (422), post/commentaire introuvable (404)
-  Pas de compte utilisateur : pseudo saisi à chaque publication

## 5. Répartition suggérée pour la présentation

- **Étudiant 1 (Backend)** : `backend/app/db/models.py`, `backend/main.py`, `backend/app/api/v1/`
- **Étudiant 2 (Frontend - fil d'actualité)** : `frontend/app/page.tsx`
- **Étudiant 3 (Frontend - commentaires)** : `frontend/app/posts/[id]/page.tsx`


