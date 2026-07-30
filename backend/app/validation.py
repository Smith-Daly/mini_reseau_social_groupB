from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ---------- Commentaire ----------

class CommentaireBase(BaseModel):
    pseudo: str
    contenu: str

    @field_validator("pseudo", "contenu")
    @classmethod
    def non_vide(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Ce champ ne peut pas être vide")
        return v.strip()


class CommentaireCreate(CommentaireBase):
    pass


class CommentaireUpdate(BaseModel):
    pseudo: Optional[str] = None
    contenu: Optional[str] = None


class Commentaire(CommentaireBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    date: datetime


# ---------- Post ----------

class PostBase(BaseModel):
    pseudo: str
    contenu: str
    image: Optional[str] = None

    @field_validator("pseudo", "contenu")
    @classmethod
    def non_vide(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Ce champ ne peut pas être vide")
        return v.strip()


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    pseudo: Optional[str] = None
    contenu: Optional[str] = None
    image: Optional[str] = None


class Post(PostBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date_publication: datetime


class PostAvecCompteur(Post):
    """Post enrichi avec le nombre de commentaires (pour le fil d'actualité)."""
    nombre_commentaires: int


class PostDetail(Post):
    """Post avec la liste complète de ses commentaires."""
    commentaires: List[Commentaire] = []
