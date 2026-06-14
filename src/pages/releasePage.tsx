import { useParams } from "react-router-dom";
import { getReleaseBySlug } from "@/config/releases";
import NotFoundPage from "@/pages/notFoundPage";

// Stub — verrà completata nella Fase 4 con landing full-screen, countdown, pre-save, streaming CTA

export default function ReleasePage() {
  const { slug } = useParams<{ slug: string }>();
  const release = slug ? getReleaseBySlug(slug) : undefined;

  if (!release) return <NotFoundPage />;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-2xl font-semibold">{release.title}</p>
    </div>
  );
}
