"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import {
  PostAvecCompteur,
  getPosts,
  creerPost,
  modifierPost,
  supprimerPost,
} from "./lib/api";

export default function PageAccueil() {
  const [posts, setPosts] = useState<PostAvecCompteur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Formulaire de création
  const [pseudo, setPseudo] = useState("");
  const [contenu, setContenu] = useState("");
  const [image, setImage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Édition
  const [idEnEdition, setIdEnEdition] = useState<number | null>(null);
  const [editContenu, setEditContenu] = useState("");

  async function chargerPosts() {
    setChargement(true);
    try {
      const data = await getPosts();
      setPosts(data);
      setErreur("");
    } catch (e: any) {
      setErreur(e.message || "Impossible de charger les posts");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerPosts();
  }, []);

  async function gererCreation(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudo.trim() || !contenu.trim()) {
      setErreur("Le pseudo et le contenu sont obligatoires");
      return;
    }
    setEnvoiEnCours(true);
    try {
      await creerPost(pseudo, contenu, image);
      setPseudo("");
      setContenu("");
      setImage("");
      setErreur("");
      await chargerPosts();
    } catch (e: any) {
      setErreur(e.message);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  function commencerEdition(post: PostAvecCompteur) {
    setIdEnEdition(post.id);
    setEditContenu(post.contenu);
  }

  async function sauvegarderEdition(id: number) {
    if (!editContenu.trim()) return;
    try {
      await modifierPost(id, { contenu: editContenu });
      setIdEnEdition(null);
      await chargerPosts();
    } catch (e: any) {
      setErreur(e.message);
    }
  }

  async function gererSuppression(id: number) {
    if (!confirm("Supprimer ce post et tous ses commentaires ?")) return;
    try {
      await supprimerPost(id);
      await chargerPosts();
      toast.success("Post supprimé avec succès");
    } catch (e: any) {
      toast.error(e.message || "Impossible de supprimer le post");
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulaire de création de post */}
      <form
        onSubmit={gererCreation}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
      >
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Créer un post</h2>
        <input
          type="text"
          placeholder="Votre pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Quoi de neuf ?"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded px-3 py-2 text-sm"
          rows={3}
        />
        <input
          type="text"
          placeholder="URL d'image (optionnel)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={envoiEnCours}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {envoiEnCours ? "Publication..." : "Publier"}
        </button>
      </form>

      {erreur && (
        <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-4 py-2 rounded text-sm">
          {erreur}
        </div>
      )}

      {/* Fil d'actualité */}
      {chargement ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Chargement...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Aucun post pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{post.pseudo}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(post.date_publication).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => commencerEdition(post)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => gererSuppression(post.id)}
                    className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>

              {idEnEdition === post.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContenu}
                    onChange={(e) => setEditContenu(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => sauvegarderEdition(post.id)}
                      className="bg-primary text-white px-3 py-1 rounded text-sm"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setIdEnEdition(null)}
                      className="text-gray-500 dark:text-gray-400 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.contenu}
                </p>
              )}

              {post.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.image}
                  alt="image du post"
                  className="mt-3 rounded-lg max-h-64 object-cover"
                />
              )}

              <Link
                href={`/posts/${post.id}`}
                className="inline-flex items-center gap-1 mt-3 text-sm text-primary dark:text-indigo-400 font-medium hover:underline"
              >
                <MessageCircle className="w-4 h-4" />
                {post.nombre_commentaires} commentaire
                {post.nombre_commentaires !== 1 ? "s" : ""}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
