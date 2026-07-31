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

export type PostDetail = Post;

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
