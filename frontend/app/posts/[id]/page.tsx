"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Send, Trash2 } from "lucide-react";
import {
  PostDetail,
  Commentaire,
  getPost,
  ajouterCommentaire,
  modifierCommentaire,
  supprimerCommentaire,
} from "../../lib/api";

export default function PageDetailPost() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [pseudo, setPseudo] = useState("");
  const [contenu, setContenu] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const [idEnEdition, setIdEnEdition] = useState<number | null>(null);
  const [editContenu, setEditContenu] = useState("");

  async function chargerPost() {
    setChargement(true);
    try {
      const data = await getPost(postId);
      setPost(data);
      setErreur("");
    } catch (e: any) {
      setErreur(e.message || "Post introuvable");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    if (!Number.isNaN(postId)) chargerPost();
  }, [postId]);

  async function gererAjout(e: React.FormEvent) {
    e.preventDefault();
    if (!pseudo.trim() || !contenu.trim()) {
      setErreur("Le pseudo et le contenu sont obligatoires");
      return;
    }
    setEnvoiEnCours(true);
    try {
      await ajouterCommentaire(postId, pseudo, contenu);
      setPseudo("");
      setContenu("");
      setErreur("");
      await chargerPost();
    } catch (e: any) {
      setErreur(e.message);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  function commencerEdition(c: Commentaire) {
    setIdEnEdition(c.id);
    setEditContenu(c.contenu);
  }

  async function sauvegarderEdition(id: number) {
    if (!editContenu.trim()) return;
    try {
      await modifierCommentaire(id, { contenu: editContenu });
      setIdEnEdition(null);
      await chargerPost();
    } catch (e: any) {
      setErreur(e.message);
    }
  }

  async function gererSuppression(id: number) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    try {
      await supprimerCommentaire(id);
      await chargerPost();
      toast.success("Commentaire supprimé avec succès");
    } catch (e: any) {
      toast.error(e.message || "Impossible de supprimer le commentaire");
    }
  }

  if (chargement)
    return <p className="text-gray-500 dark:text-gray-400 text-center">Chargement...</p>;
  if (!post)
    return (
      <p className="text-red-600 dark:text-red-400 text-center">
        {erreur || "Post introuvable"}
      </p>
    );

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-primary dark:text-indigo-400 text-sm hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au fil d'actualité
      </Link>

      {/* Post */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{post.pseudo}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(post.date_publication).toLocaleString("fr-FR")}
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {post.contenu}
        </p>
        {post.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image}
            alt="image du post"
            className="mt-3 rounded-lg max-h-80 object-cover"
          />
        )}
      </div>

      {erreur && (
        <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-4 py-2 rounded text-sm">
          {erreur}
        </div>
      )}

      {/* Formulaire d'ajout de commentaire */}
     <form
        onSubmit={gererAjout}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3"
      >
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Ajouter un commentaire</h2>
        <input
          type="text"
          placeholder="Votre pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Votre commentaire"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 rounded px-3 py-2 text-sm"
          rows={2}
        />
        <button
          type="submit"
          disabled={envoiEnCours}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {envoiEnCours ? "Envoi..." : "Commenter"}
        </button>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">
          {post.commentaires.length} commentaire
          {post.commentaires.length !== 1 ? "s" : ""}
        </h2>
        {post.commentaires.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucun commentaire pour l'instant.
          </p>
        ) : (
          post.commentaires.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                    {c.pseudo}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(c.date).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => commencerEdition(c)}
                    className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => gererSuppression(c.id)}
                    className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>

              {idEnEdition === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContenu}
                    onChange={(e) => setEditContenu(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => sauvegarderEdition(c.id)}
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
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {c.contenu}
                </p>
              )}
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
