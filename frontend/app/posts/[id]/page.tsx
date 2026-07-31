"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostDetail, getPost } from "../../lib/api";

export default function PageDetailPost() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

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
    </div>
  );
}
