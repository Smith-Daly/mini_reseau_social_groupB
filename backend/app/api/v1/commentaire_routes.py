from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.db.models import Commentaire
from app.validation import Commentaire as CommentaireSchema, CommentaireUpdate

commentaire_routes = APIRouter(prefix="/commentaires", tags=["commentaires"])


@commentaire_routes.put("/{id}", response_model=CommentaireSchema)
def modifier_commentaire(id: int, commentaire: CommentaireUpdate, db: Session = Depends(get_db)):
    """Modifier un commentaire."""
    db_commentaire = db.query(Commentaire).filter(Commentaire.id == id).first()
    if not db_commentaire:
        raise HTTPException(status_code=404, detail="Commentaire introuvable")
    for champ, valeur in commentaire.model_dump(exclude_unset=True).items():
        setattr(db_commentaire, champ, valeur)
    db.commit()
    db.refresh(db_commentaire)
    return db_commentaire


@commentaire_routes.delete("/{id}", status_code=204)
def supprimer_commentaire(id: int, db: Session = Depends(get_db)):
    """Supprimer un commentaire."""
    db_commentaire = db.query(Commentaire).filter(Commentaire.id == id).first()
    if not db_commentaire:
        raise HTTPException(status_code=404, detail="Commentaire introuvable")
    db.delete(db_commentaire)
    db.commit()
    return None
