from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.dependencies import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    pseudo = Column(String(50), nullable=False)
    contenu = Column(Text, nullable=False)
    image = Column(String(255), nullable=True)
    date_publication = Column(DateTime(timezone=True), server_default=func.now())

    commentaires = relationship(
        "Commentaire", back_populates="post", cascade="all, delete-orphan"
    )


class Commentaire(Base):
    __tablename__ = "commentaires"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    pseudo = Column(String(50), nullable=False)
    contenu = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="commentaires")
