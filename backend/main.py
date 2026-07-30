from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Le schéma de la base (création/évolution des tables) est géré par Alembic.
# Voir alembic/ et README.md : lancer `alembic upgrade head` avant de démarrer l'API.

app = FastAPI(title="Mini Réseau Social - API", version="1.0.0")


from app.api.v1.commentaire_routes import commentaire_routes
from app.api.v1.post_routes import post_routes

# CORS pour permettre au frontend Next.js (localhost:3000) d'appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post_routes)
app.include_router(commentaire_routes)


@app.get("/")
def racine():
    return {"message": "API Mini Réseau Social - voir /docs pour la documentation"}
