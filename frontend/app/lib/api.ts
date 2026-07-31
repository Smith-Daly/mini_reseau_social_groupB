const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Post {
  id: number;
  pseudo: string;
  contenu: string;
  image?: string | null;
  date_publication: string;
}

export interface PostAvecCompteur extends Post {
  nombre_commentaires: number;
}

export interface Commentaire {
  id: number;
  post_id: number;
  pseudo: string;
  contenu: string;
  date: string;
}

export interface PostDetail extends Post {
  commentaires: Commentaire[];
}

async function traiterReponse(res: Response) {
  if (!res.ok) {
    let message = "Une erreur est survenue";
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch {
      // pas de corps JSON
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------- Posts ----------

export async function getPosts(): Promise<PostAvecCompteur[]> {
  const res = await fetch(`${API_URL}/posts`, { cache: "no-store" });
  return traiterReponse(res);
}

export async function getPost(id: number): Promise<PostDetail> {
  const res = await fetch(`${API_URL}/posts/${id}`, { cache: "no-store" });
  return traiterReponse(res);
}

export async function creerPost(pseudo: string, contenu: string, image?: string) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo, contenu, image: image || null }),
  });
  return traiterReponse(res);
}

export async function modifierPost(
  id: number,
  data: Partial<{ pseudo: string; contenu: string; image: string }>
) {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return traiterReponse(res);
}

export async function supprimerPost(id: number) {
  const res = await fetch(`${API_URL}/posts/${id}`, { method: "DELETE" });
  return traiterReponse(res);
}

// ---------- Commentaires ----------

export async function getCommentaires(postId: number): Promise<Commentaire[]> {
  const res = await fetch(`${API_URL}/posts/${postId}/commentaires`, {
    cache: "no-store",
  });
  return traiterReponse(res);
}

export async function ajouterCommentaire(postId: number, pseudo: string, contenu: string) {
  const res = await fetch(`${API_URL}/posts/${postId}/commentaires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pseudo, contenu }),
  });
  return traiterReponse(res);
}

export async function modifierCommentaire(
  id: number,
  data: Partial<{ pseudo: string; contenu: string }>
) {
  const res = await fetch(`${API_URL}/commentaires/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return traiterReponse(res);
}

export async function supprimerCommentaire(id: number) {
  const res = await fetch(`${API_URL}/commentaires/${id}`, { method: "DELETE" });
  return traiterReponse(res);
}
