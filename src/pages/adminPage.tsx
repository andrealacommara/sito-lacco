import { Helmet } from "react-helmet-async";
import DefaultLayout from "@/layouts/default";

// Stub — verrà completata nella Fase 8 con Supabase Auth + subscribers list + broadcast UI

export default function AdminPage() {
  return (
    <DefaultLayout>
      <Helmet>
        <title>Admin | Lacco</title>
        <meta content="noindex, nofollow" name="robots" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-default-500">Area admin — in costruzione.</p>
      </div>
    </DefaultLayout>
  );
}
