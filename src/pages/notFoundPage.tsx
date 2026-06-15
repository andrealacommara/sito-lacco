import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DefaultLayout from "@/layouts/default";

export default function NotFoundPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Pagina non trovata | Lacco</title>
        <meta content="noindex, nofollow" name="robots" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <p className="text-8xl font-bold text-danger">404</p>
        <h1 className="text-2xl font-semibold">Pagina non trovata</h1>
        <p className="text-default-500">
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <Link
          className="text-danger hover:underline font-medium"
          to="/"
        >
          ← Torna alla home
        </Link>
      </div>
    </DefaultLayout>
  );
}
