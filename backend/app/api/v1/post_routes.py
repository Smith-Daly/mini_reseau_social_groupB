from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.db.models import Commentaire, Post
from app.validation import (
    Commentaire as CommentaireSchema,
    CommentaireCreate,
    Post as PostSchema,
    PostAvecCompteur,
    PostCreate,
    PostDetail,
    PostUpdate,
)

post_routes = APIRouter(prefix="/posts", tags=["posts"])


@post_routes.get("", response_model=List[PostAvecCompteur])
def liste_posts(db: Session = Depends(get_db)):
    """Liste des posts, triés du plus récent au plus ancien, avec compteur de commentaires."""
    resultats = (
        db.query(Post, func.count(Commentaire.id).label("nombre_commentaires"))
        .outerjoin(Commentaire, Commentaire.post_id == Post.id)
        .group_by(Post.id)
        .order_by(Post.date_publication.desc())
        .all()
    )

    posts = []
    for post, nb in resultats:
        data = PostSchema.model_validate(post).model_dump()
        data["nombre_commentaires"] = nb
        posts.append(PostAvecCompteur(**data))
    return posts


@post_routes.get("/{id}", response_model=PostDetail)
def detail_post(id: int, db: Session = Depends(get_db)):
    """Détail d'un post."""
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    return post


@post_routes.post("", response_model=PostSchema, status_code=201)
def creer_post(post: PostCreate, db: Session = Depends(get_db)):
    """Créer un post."""
    db_post = Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@post_routes.put("/{id}", response_model=PostSchema)
def modifier_post(id: int, post: PostUpdate, db: Session = Depends(get_db)):
    """Modifier un post."""
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    for champ, valeur in post.model_dump(exclude_unset=True).items():
        setattr(db_post, champ, valeur)
    db.commit()
    db.refresh(db_post)
    return db_post


@post_routes.delete("/{id}", status_code=204)
def supprimer_post(id: int, db: Session = Depends(get_db)):
    """Supprimer un post (et ses commentaires en cascade)."""
    db_post = db.query(Post).filter(Post.id == id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    db.delete(db_post)
    db.commit()
    return None


# ---------- Commentaires d'un post ----------

@post_routes.get("/{id}/commentaires", response_model=List[CommentaireSchema])
def liste_commentaires(id: int, db: Session = Depends(get_db)):
    """Liste des commentaires d'un post."""
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    return (
        db.query(Commentaire)
        .filter(Commentaire.post_id == id)
        .order_by(Commentaire.date.asc())
        .all()
    )


@post_routes.post("/{id}/commentaires", response_model=CommentaireSchema, status_code=201)
def ajouter_commentaire(id: int, commentaire: CommentaireCreate, db: Session = Depends(get_db)):
    """Ajouter un commentaire à un post."""
    post = db.query(Post).filter(Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable")
    db_commentaire = Commentaire(post_id=id, **commentaire.model_dump())
    db.add(db_commentaire)
    db.commit()
    db.refresh(db_commentaire)
    return db_commentaire
