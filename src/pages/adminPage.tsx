import type { Session } from "@supabase/supabase-js";
import type {
  AdminStatsResponse,
  AdminSubscriber,
  AdminSubscribersResponse,
  AdminSyncResendResponse,
  AdminUnsubscribeResponse,
  BroadcastBody,
  BroadcastResponse,
  SendMagicLinkResponse,
} from "@/types/api";

import { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Label,
  Input,
  Description,
  Button,
  Checkbox,
  CheckboxControl,
  CheckboxIndicator,
  Chip,
  Skeleton,
  Spinner,
  toast,
  CheckboxContent,
} from "@heroui/react";
import { Helmet } from "react-helmet-async";
import clsx from "clsx";
import RefreshIcon from "@/assets/icons/refresh.svg?react";

import RichTextEditor from "@/components/richTextEditor";
import TemplateStudio from "@/components/admin/templateStudio";
import InstagramSection from "@/components/admin/instagramSection";
import AdminSelect from "@/components/admin/adminSelect";
import DefaultLayout from "@/layouts/default";
import { supabase, EF_BASE } from "@/lib/supabase";
import { broadcastEmailHtml } from "@/emails/templates";

type View = "login" | "check-email" | "dashboard";
type Section = "newsletter" | "template" | "instagram";
type Tab = "subscribers" | "broadcast" | "individuale";
type FilterStatus = "" | "confirmed" | "unsubscribed" | "bounced";
type SortBy = "email" | "status" | "source" | "createdAt";
type SortDir = "asc" | "desc";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "iscritto",
  unsubscribed: "disiscritto",
  bounced: "rimbalzato",
};

const STATUS_COLOR: Record<
  string,
  "success" | "warning" | "default" | "danger"
> = {
  confirmed: "success",
  unsubscribed: "default",
  bounced: "danger",
};

const SOURCE_LABEL: Record<string, string> = {
  presave_form: "Pre-save",
  newsletter_form: "Newsletter",
  manual: "Manuale",
};

const PAGE_SIZE_OPTIONS = [15, 30, 50, 100];

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [section, setSection] = useState<Section>("instagram");
  const [tab, setTab] = useState<Tab>("subscribers");
  const [loginLoading, setLoginLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);

  // Subscribers list
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const [sortBy, setSortBy] = useState<SortBy>("email");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subsLoading, setSubsLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<
    AdminSubscriber[]
  >([]);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);
  const [confirmUnsubscribe, setConfirmUnsubscribe] = useState(false);

  // Add subscriber
  const [addEmail, setAddEmail] = useState("");
  const [addFirstName, setAddFirstName] = useState("");
  const [addConsentDate, setAddConsentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [addLoading, setAddLoading] = useState(false);

  // Broadcast / invio singolo (composer condiviso fra le due tab)
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [imagePublicUrl, setImagePublicUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [dryCount, setDryCount] = useState<number | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  // Tema dell'anteprima email: default = tema corrente del sito, poi controllato
  // dal toggle dedicato (indipendente dal tema del sito).
  const [previewDark, setPreviewDark] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );

  // ── Auth ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setView("dashboard");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) setView("dashboard");
      else setView("login");
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Stats ───────────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async (sess: Session) => {
    try {
      const res = await fetch(`${EF_BASE}/admin-stats`, {
        headers: { Authorization: `Bearer ${sess.access_token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStats((await res.json()) as AdminStatsResponse);
    } catch {
      // La dashboard è un'informazione accessoria: nessun toast se il fetch fallisce.
    }
  }, []);

  useEffect(() => {
    if (view === "dashboard" && tab === "subscribers" && session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats(session);
    }
  }, [view, tab, session, fetchStats]);

  // ── Subscribers ─────────────────────────────────────────────────────────────

  const fetchSubscribers = useCallback(
    async (
      sess: Session,
      p: number,
      ps: number,
      fs: FilterStatus,
      q: string,
      sb: SortBy,
      sd: SortDir,
    ) => {
      setSubsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: String(ps),
          sortBy: sb,
          sortDir: sd,
        });

        if (fs) params.set("status", fs);
        if (q) params.set("search", q);
        const res = await fetch(`${EF_BASE}/admin-subscribers?${params}`, {
          headers: { Authorization: `Bearer ${sess.access_token}` },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AdminSubscribersResponse;

        setSubscribers(data.subscribers ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.danger("Errore nel caricamento iscritti");
      } finally {
        setSubsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (view === "dashboard" && tab === "subscribers" && session) {
      // fetchSubscribers gestisce il proprio loading state: è il fetch-on-deps-change
      // standard, non un caso di derived state che andrebbe spostato fuori dall'effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSubscribers(
        session,
        page,
        pageSize,
        filterStatus,
        search,
        sortBy,
        sortDir,
      );
    }
  }, [
    view,
    tab,
    session,
    page,
    pageSize,
    filterStatus,
    search,
    sortBy,
    sortDir,
    fetchSubscribers,
  ]);

  // Debounce della ricerca: aspetta che l'utente finisca di digitare prima di rifare la fetch.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(t);
  }, [searchInput]);

  const switchTab = (t: Tab) => {
    setConfirmSend(false);
    setConfirmUnsubscribe(false);
    setTab(t);
  };

  const toggleSelectSubscriber = (s: AdminSubscriber) => {
    setSelectedSubscribers((prev) =>
      prev.some((p) => p.id === s.id)
        ? prev.filter((p) => p.id !== s.id)
        : [...prev, s],
    );
  };

  const selectAllOnPage = () => {
    setSelectedSubscribers((prev) => {
      const ids = new Set(prev.map((p) => p.id));

      return [...prev, ...subscribers.filter((s) => !ids.has(s.id))];
    });
  };

  const unsubscribableSelected = selectedSubscribers.filter(
    (s) => s.status !== "unsubscribed",
  );

  const allOnPageSelected =
    subscribers.length > 0 &&
    subscribers.every((s) =>
      selectedSubscribers.some((sel) => sel.id === s.id),
    );
  const someOnPageSelected =
    !allOnPageSelected &&
    subscribers.some((s) => selectedSubscribers.some((sel) => sel.id === s.id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedSubscribers((prev) =>
        prev.filter((p) => !subscribers.some((s) => s.id === p.id)),
      );
    } else {
      selectAllOnPage();
    }
  };

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSyncResend = async () => {
    if (!session) return;
    setSyncLoading(true);
    try {
      const res = await fetch(`${EF_BASE}/admin-sync-resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = (await res.json()) as AdminSyncResendResponse;

      if (data.ok) {
        toast.success(
          `Sincronizzato: ${data.updated ?? 0} aggiornati su ${data.checked ?? 0} contatti Resend`,
        );
        await fetchSubscribers(
          session,
          page,
          pageSize,
          filterStatus,
          search,
          sortBy,
          sortDir,
        );
        await fetchStats(session);
      } else {
        toast.danger(data.error ?? "Errore sincronizzazione");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleUnsubscribeSelected = async () => {
    if (!confirmUnsubscribe) {
      setConfirmUnsubscribe(true);

      return;
    }
    if (!session || unsubscribableSelected.length === 0) return;
    setUnsubscribeLoading(true);
    setConfirmUnsubscribe(false);
    try {
      const res = await fetch(`${EF_BASE}/admin-subscribers`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ids: unsubscribableSelected.map((s) => s.id),
        }),
      });
      const data = (await res.json()) as AdminUnsubscribeResponse;

      if (data.ok) {
        toast.success(`Disiscritti ${data.updated ?? 0} iscritti`);
        setSelectedSubscribers([]);
        await fetchSubscribers(
          session,
          page,
          pageSize,
          filterStatus,
          search,
          sortBy,
          sortDir,
        );
        await fetchStats(session);
      } else {
        toast.danger(data.error ?? "Errore durante la disiscrizione");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch(`${EF_BASE}/send-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirectTo: `${window.location.origin}/admin`,
        }),
      });
      const data: SendMagicLinkResponse = await res.json();

      if (!data.ok) {
        toast.danger(data.message ?? "Errore nell'invio");
      } else {
        setView("check-email");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (
      !addEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addEmail.trim())
    ) {
      toast.danger("Email non valida");

      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch(`${EF_BASE}/admin-subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: addEmail.trim(),
          firstName: addFirstName.trim() || undefined,
          consentTimestamp: new Date(addConsentDate).toISOString(),
        }),
      });
      const data = await res.json();

      if (data.ok) {
        toast.success("Iscritto aggiunto");
        setAddEmail("");
        setAddFirstName("");
        await fetchSubscribers(
          session,
          page,
          pageSize,
          filterStatus,
          search,
          sortBy,
          sortDir,
        );
        await fetchStats(session);
      } else {
        toast.danger(data.error ?? "Errore durante l'aggiunta");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setAddLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !session) return;
    setImageUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("broadcast-images")
      .upload(path, file, { upsert: false });

    if (error) {
      toast.danger("Errore upload immagine");
    } else {
      const { data } = supabase.storage
        .from("broadcast-images")
        .getPublicUrl(path);

      setImagePublicUrl(data.publicUrl);
    }
    setImageUploading(false);
    e.target.value = "";
  };

  const normalizeUrl = (url: string) => {
    const u = url.trim();

    if (!u) return u;
    if (/^[a-z]+:\/\//i.test(u)) return u;

    return /^www\./i.test(u) ? `https://${u}` : `https://www.${u}`;
  };

  const buildBroadcastHtml = (
    preview = false,
    previewScheme?: "light" | "dark",
  ) =>
    broadcastEmailHtml({
      body: emailBody || "Corpo dell'email…",
      imageUrl: imagePublicUrl || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: normalizeUrl(ctaUrl) || undefined,
      unsubscribeUrl: "{{{ RESEND_UNSUBSCRIBE_URL }}}",
      preview,
      previewScheme,
    });

  const handleDryRun = async () => {
    if (!session) return;
    setBroadcastLoading(true);
    try {
      const payload: BroadcastBody = {
        subject: subject || "(bozza)",
        htmlBody: buildBroadcastHtml(),
        dry: true,
      };
      const res = await fetch(`${EF_BASE}/admin-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BroadcastResponse;

      setDryCount(data.recipientCount ?? 0);
    } catch {
      toast.danger("Errore dry run");
    } finally {
      setBroadcastLoading(false);
    }
  };

  useEffect(() => {
    if (view === "dashboard" && tab === "broadcast" && session) {
      // Il conteggio dipende solo dagli iscritti confermati, non dal contenuto della
      // mail: basta calcolarlo una volta all'apertura della tab.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleDryRun();
    }
  }, [view, tab, session]);

  const handleSend = async (recipientIds?: string[]) => {
    if (!subject.trim() || !emailBody.replace(/<[^>]*>/g, "").trim()) {
      toast.danger("Compila oggetto e testo della mail");

      return;
    }
    if (!confirmSend) {
      setConfirmSend(true);

      return;
    }
    if (!session) return;
    setBroadcastLoading(true);
    setConfirmSend(false);
    try {
      const payload: BroadcastBody = {
        subject: subject.trim(),
        htmlBody: buildBroadcastHtml(),
        ...(recipientIds ? { recipientIds } : {}),
      };
      const res = await fetch(`${EF_BASE}/admin-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as BroadcastResponse;

      if (data.ok) {
        const syncNote = data.syncUpdated
          ? ` (${data.syncUpdated} contatti riallineati con Resend prima dell'invio)`
          : "";

        toast.success(
          recipientIds
            ? `Inviato a ${data.sent ?? 0} destinatari`
            : `Inviato a ${data.recipientCount ?? 0} iscritti${syncNote}`,
        );
        setSubject("");
        setEmailBody("");
        setImagePublicUrl("");
        setCtaText("");
        setCtaUrl("");
        setDryCount(null);
        if (recipientIds) setSelectedSubscribers([]);
      } else {
        toast.danger(data.error ?? "Errore invio");
      }
    } catch {
      toast.danger("Errore di rete");
    } finally {
      setBroadcastLoading(false);
    }
  };

  // ── Login view ───────────────────────────────────────────────────────────────

  if (view === "login") {
    return (
      <DefaultLayout>
        <Helmet>
          <title>Admin | Lacco</title>
          <meta content="noindex, nofollow" name="robots" />
        </Helmet>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-xl font-semibold">Area admin</h1>
            <form onSubmit={handleLogin}>
              <Button
                className="rounded-xl"
                isDisabled={loginLoading}
                type="submit"
                variant="danger"
              >
                {loginLoading ? <Spinner size="sm" /> : "Accedi"}
              </Button>
            </form>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (view === "check-email") {
    return (
      <DefaultLayout>
        <Helmet>
          <title>Admin | Lacco</title>
          <meta content="noindex, nofollow" name="robots" />
        </Helmet>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg font-medium">Controlla la tua email</p>
            <p className="text-default-500 text-sm">
              Ti abbiamo inviato un link valido per 1 ora.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  const composerValid =
    !!subject.trim() && !!emailBody.replace(/<[^>]*>/g, "").trim();
  const isIndividuale = tab === "individuale";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DefaultLayout>
      <Helmet>
        <title>Admin | Lacco</title>
        <meta content="noindex, nofollow" name="robots" />
      </Helmet>
      <div className="py-8">
        <div className="max-w-4xl mx-auto mb-2 flex justify-end">
          <Button
            className="rounded-xl"
            size="sm"
            variant="danger-soft"
            onPress={() => supabase.auth.signOut()}
          >
            Esci
          </Button>
        </div>
        <div className="max-w-4xl py-6 mx-auto flex flex-col gap-6">
          {/* Section bar: Instagram | Newsletter | Template */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <Button
              className="rounded-xl font-semibold shrink-0"
              size="sm"
              variant={section === "instagram" ? "danger" : "outline"}
              onPress={() => setSection("instagram")}
            >
              Instagram
            </Button>
            <Button
              className="rounded-xl font-semibold shrink-0"
              size="sm"
              variant={section === "newsletter" ? "danger" : "outline"}
              onPress={() => setSection("newsletter")}
            >
              Newsletter
            </Button>
            <Button
              className="rounded-xl font-semibold shrink-0"
              size="sm"
              variant={section === "template" ? "danger" : "outline"}
              onPress={() => setSection("template")}
            >
              Template
            </Button>
          </div>

          {section === "template" && <TemplateStudio />}

          {section === "instagram" && session && (
            <InstagramSection session={session} />
          )}

          {section === "newsletter" && (
            <>
              {/* Tab bar */}
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                <Button
                  className="rounded-xl font-semibold shrink-0"
                  size="sm"
                  variant={tab === "subscribers" ? "danger" : "outline"}
                  onPress={() => switchTab("subscribers")}
                >
                  Iscritti
                </Button>
                <Button
                  className="rounded-xl font-semibold shrink-0"
                  size="sm"
                  variant={tab === "broadcast" ? "danger" : "outline"}
                  onPress={() => switchTab("broadcast")}
                >
                  Broadcast
                </Button>
                <Button
                  className="rounded-xl font-semibold shrink-0"
                  size="sm"
                  variant={tab === "individuale" ? "danger" : "outline"}
                  onPress={() => switchTab("individuale")}
                >
                  <span className="hidden sm:inline">Invio singolo</span>
                  <span className="sm:hidden">Singolo</span>
                  {selectedSubscribers.length > 0
                    ? ` (${selectedSubscribers.length})`
                    : ""}
                </Button>
              </div>

              {/* ── SUBSCRIBERS TAB ─────────────────────────────────────────────── */}
              {tab === "subscribers" && (
                <div className="flex flex-col gap-6">
                  {/* Dashboard */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                      color="success"
                      label="Confermati"
                      value={stats?.confirmed}
                    />
                    <StatCard
                      color="default"
                      label="Disiscritti"
                      value={stats?.unsubscribed}
                    />
                    <StatCard
                      color="danger"
                      label="Rimbalzati"
                      value={stats?.bounced}
                    />
                    <StatCard
                      color="primary"
                      label="Nuovi (7gg)"
                      value={stats?.newLast7Days}
                    />
                  </div>

                  {/* Search */}
                  <TextField
                    aria-label="Cerca per email o nome"
                    className="w-full"
                    value={searchInput}
                    onChange={setSearchInput}
                  >
                    <div className="relative flex items-center">
                      <svg
                        className="absolute left-2 text-default-400 pointer-events-none"
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="21" x2="16.65" y1="21" y2="16.65" />
                      </svg>
                      <Input
                        className="w-full pl-8 pr-8"
                        placeholder="Cerca per email o nome…"
                      />
                      {searchInput && (
                        <button
                          aria-label="Cancella ricerca"
                          className="absolute right-2 flex items-center justify-center text-default-400 hover:text-default-600"
                          type="button"
                          onClick={() => setSearchInput("")}
                        >
                          <svg
                            fill="none"
                            height="14"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="14"
                          >
                            <line x1="18" x2="6" y1="6" y2="18" />
                            <line x1="6" x2="18" y1="6" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </TextField>

                  {/* Status filter + azioni */}
                  <div className="flex items-center justify-between gap-2">
                    <AdminSelect
                      aria-label="Filtra per stato"
                      className="w-auto min-w-32 sm:w-40"
                      options={[
                        { key: "all", label: "Tutti" },
                        { key: "confirmed", label: "Confermati" },
                        { key: "unsubscribed", label: "Disiscritti" },
                        { key: "bounced", label: "Rimbalzati" },
                      ]}
                      selectedKey={filterStatus || "all"}
                      onSelectionChange={(key) => {
                        const value = key == null ? undefined : String(key);

                        setFilterStatus(
                          (value === "all"
                            ? ""
                            : (value ?? "")) as FilterStatus,
                        );
                        setPage(1);
                      }}
                    />
                    <Button
                      className="rounded-xl"
                      isDisabled={syncLoading}
                      size="sm"
                      variant="secondary"
                      onPress={handleSyncResend}
                    >
                      {syncLoading && <Spinner size="sm" />}
                      {!syncLoading && (
                        <>
                          <RefreshIcon aria-hidden className="w-4 h-4" />
                          Aggiorna
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Selection bar */}
                  {selectedSubscribers.length > 0 && (
                    <div className="flex flex-col gap-3 text-sm rounded-lg px-3 py-3 bg-default-50 border border-default-100">
                      <div className="text-center text-default-700 font-semibold">
                        {selectedSubscribers.length} selezionati
                      </div>

                      {!confirmUnsubscribe ? (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 rounded-xl"
                            size="sm"
                            variant="secondary"
                            onPress={() => setSelectedSubscribers([])}
                          >
                            Deseleziona
                          </Button>
                          <Button
                            className="flex-1 rounded-xl font-semibold"
                            size="sm"
                            variant="primary"
                            onPress={() => switchTab("individuale")}
                          >
                            Scrivi
                          </Button>
                          <Button
                            className="flex-1 rounded-xl"
                            isDisabled={unsubscribableSelected.length === 0}
                            size="sm"
                            variant="danger"
                            onPress={handleUnsubscribeSelected}
                          >
                            Disiscrivi
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-xs text-danger font-medium">
                            Confermi la disiscrizione?
                          </span>
                          <div className="flex gap-2">
                            <Button
                              className="rounded-xl"
                              isDisabled={unsubscribeLoading}
                              size="sm"
                              variant="danger"
                              onPress={handleUnsubscribeSelected}
                            >
                              {unsubscribeLoading ? (
                                <Spinner size="sm" />
                              ) : (
                                "Sì, disiscrivi"
                              )}
                            </Button>
                            <Button
                              className="rounded-xl"
                              size="sm"
                              variant="outline"
                              onPress={() => setConfirmUnsubscribe(false)}
                            >
                              Annulla
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Header colonne */}
                  {!subsLoading && subscribers.length > 0 && (
                    <div className="flex items-center gap-3 px-2 pb-2 border-b border-default-200 text-xs font-medium text-default-400 uppercase tracking-wide">
                      <Checkbox
                        aria-label="Seleziona tutti gli iscritti in pagina"
                        isIndeterminate={someOnPageSelected}
                        isSelected={allOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                      >
                        <CheckboxContent>
                          <CheckboxControl>
                            <CheckboxIndicator />
                          </CheckboxControl>
                        </CheckboxContent>
                      </Checkbox>
                      <button
                        className="rounded-xl flex-1 flex items-center gap-1 text-left hover:text-default-600"
                        type="button"
                        onClick={() => handleSort("email")}
                      >
                        Iscritto
                        {sortBy === "email" && (
                          <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                        )}
                      </button>
                      <button
                        className="rounded-xl flex items-center gap-1 hover:text-default-600"
                        type="button"
                        onClick={() => handleSort("status")}
                      >
                        Stato
                        {sortBy === "status" && (
                          <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                        )}
                      </button>
                      <button
                        className="rounded-xl hidden sm:flex items-center gap-1 w-24 shrink-0 hover:text-default-600"
                        type="button"
                        onClick={() => handleSort("source")}
                      >
                        Fonte
                        {sortBy === "source" && (
                          <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                        )}
                      </button>
                      <button
                        className="rounded-xl flex items-center justify-end gap-1 w-20 shrink-0 hover:text-default-600"
                        type="button"
                        onClick={() => handleSort("createdAt")}
                      >
                        Data
                        {sortBy === "createdAt" && (
                          <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* List */}
                  {subsLoading ? (
                    <div className="flex flex-col gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="rounded-lg">
                          <div className="h-10 w-full rounded-lg bg-default-200" />
                        </Skeleton>
                      ))}
                    </div>
                  ) : subscribers.length === 0 ? (
                    <p className="text-default-400 text-sm py-6 text-center">
                      Nessun iscritto trovato.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {subscribers.map((s) => (
                        <div
                          key={s.id}
                          aria-pressed={selectedSubscribers.some(
                            (sel) => sel.id === s.id,
                          )}
                          className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl border-b border-default-100 text-sm hover:bg-default-50 transition-colors cursor-pointer select-none"
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSelectSubscriber(s)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleSelectSubscriber(s);
                            }
                          }}
                        >
                          <Checkbox
                            className="pointer-events-none"
                            isSelected={selectedSubscribers.some(
                              (sel) => sel.id === s.id,
                            )}
                          >
                            <CheckboxControl>
                              <CheckboxIndicator />
                            </CheckboxControl>
                          </Checkbox>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{s.email}</p>
                            {(s.firstName || s.releaseSlug) && (
                              <p className="text-xs text-default-400 truncate">
                                {[s.firstName, s.releaseSlug]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>
                          <Chip
                            color={STATUS_COLOR[s.status] ?? "default"}
                            size="sm"
                            variant="soft"
                          >
                            {STATUS_LABEL[s.status] ?? s.status}
                          </Chip>
                          <span className="hidden sm:inline text-xs text-default-400 w-24 shrink-0 truncate">
                            {SOURCE_LABEL[s.source] ?? s.source}
                          </span>
                          <span className="text-xs text-default-400 w-20 shrink-0 text-right">
                            {new Date(s.createdAt).toLocaleDateString("it-IT")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {!subsLoading && subscribers.length > 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        isIconOnly
                        aria-label="Pagina precedente"
                        className="rounded-xl"
                        isDisabled={page <= 1}
                        size="sm"
                        variant="secondary"
                        onPress={() => setPage((p) => p - 1)}
                      >
                        ←
                      </Button>
                      <span className="text-sm text-default-500 whitespace-nowrap px-1">
                        {page} / {totalPages}
                      </span>
                      <Button
                        isIconOnly
                        aria-label="Pagina successiva"
                        className="rounded-xl"
                        isDisabled={page >= totalPages}
                        size="sm"
                        variant="secondary"
                        onPress={() => setPage((p) => p + 1)}
                      >
                        →
                      </Button>
                      <AdminSelect
                        aria-label="Contatti per pagina"
                        className="w-16 sm:w-20 ml-1"
                        options={PAGE_SIZE_OPTIONS.map((n) => ({
                          key: String(n),
                          label: String(n),
                        }))}
                        selectedKey={String(pageSize)}
                        onSelectionChange={(key) => {
                          if (key != null) {
                            setPageSize(Number(key));
                            setPage(1);
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Add manually */}
                  <div className="bg-default-50 border border-default-100 rounded-xl p-4 md:p-5">
                    <h2 className="text-sm font-semibold mb-4">
                      Aggiungi manualmente
                    </h2>
                    <form
                      className="flex flex-col items-center gap-3"
                      onSubmit={handleAddSubscriber}
                    >
                      <div className="flex gap-3 flex-wrap w-full">
                        <TextField
                          className="flex-1 min-w-0 sm:min-w-48 flex flex-col gap-1.5"
                          type="email"
                          value={addEmail}
                          onChange={setAddEmail}
                        >
                          <Label>Email</Label>
                          <Input placeholder="nome@email.com" />
                        </TextField>
                        <TextField
                          className="flex-1 min-w-0 sm:min-w-32 flex flex-col gap-1.5"
                          type="text"
                          value={addFirstName}
                          onChange={setAddFirstName}
                        >
                          <Label>Nome</Label>
                          <Input placeholder="Nome" />
                        </TextField>
                        <TextField
                          className="w-full md:w-auto flex flex-col gap-1.5"
                          type="date"
                          value={addConsentDate}
                          onChange={setAddConsentDate}
                        >
                          <Label>Data consenso</Label>
                          <Input className="w-full" />
                        </TextField>
                      </div>
                      <Button
                        className="rounded-xl font-semibold"
                        isDisabled={addLoading}
                        size="lg"
                        type="submit"
                        variant="danger"
                      >
                        {addLoading ? <Spinner size="sm" /> : "Aggiungi"}
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── BROADCAST / INVIO SINGOLO (composer condiviso) ──────────────── */}
              {(tab === "broadcast" || tab === "individuale") && (
                <div className="flex flex-col gap-5">
                  {isIndividuale && selectedSubscribers.length === 0 ? (
                    <p className="text-default-400 text-sm py-6 text-center">
                      Nessun destinatario selezionato. Vai nella tab Iscritti e
                      seleziona almeno una persona.
                    </p>
                  ) : (
                    <>
                      {isIndividuale && (
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-default-500">Destinatari:</span>
                          {selectedSubscribers.map((s) => (
                            <Chip key={s.id} size="sm" variant="soft">
                              <span className="inline-flex items-center gap-1">
                                {s.email}
                                <button
                                  aria-label={`Rimuovi ${s.email}`}
                                  className="rounded-xl inline-flex items-center justify-center opacity-60 hover:opacity-100"
                                  type="button"
                                  onClick={() => toggleSelectSubscriber(s)}
                                >
                                  <svg
                                    fill="none"
                                    height="12"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    width="12"
                                  >
                                    <line x1="18" x2="6" y1="6" y2="18" />
                                    <line x1="6" x2="18" y1="6" y2="18" />
                                  </svg>
                                </button>
                              </span>
                            </Chip>
                          ))}
                        </div>
                      )}

                      {/* Composer */}
                      <div className="flex flex-col gap-4">
                        <TextField
                          className="flex flex-col gap-1.5"
                          value={subject}
                          onChange={setSubject}
                        >
                          <Label>Oggetto email</Label>
                          <Input placeholder="Es: Nuovo singolo in arrivo" />
                        </TextField>
                        <RichTextEditor
                          placeholder="Scrivi il corpo della mail…"
                          value={emailBody}
                          variant="flat"
                          onChange={setEmailBody}
                        />
                        <div className="flex flex-col gap-1.5">
                          <p className="text-sm font-medium">Immagine</p>
                          <div className="relative">
                            <label
                              className="flex items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-default-200 hover:border-default-400 transition-colors cursor-pointer overflow-hidden bg-default-50"
                              htmlFor="image-upload"
                            >
                              {imageUploading ? (
                                <span className="text-xs text-default-400">
                                  Caricamento…
                                </span>
                              ) : imagePublicUrl ? (
                                <img
                                  alt="Anteprima"
                                  className="w-full h-full object-cover"
                                  src={imagePublicUrl}
                                />
                              ) : (
                                <span className="text-default-400 text-2xl leading-none">
                                  +
                                </span>
                              )}
                            </label>
                            {imagePublicUrl && (
                              <button
                                aria-label="Rimuovi immagine"
                                className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                type="button"
                                onClick={() => setImagePublicUrl("")}
                              >
                                <svg
                                  fill="none"
                                  height="12"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeWidth="2"
                                  viewBox="0 0 12 12"
                                  width="12"
                                >
                                  <line x1="1" x2="11" y1="1" y2="11" />
                                  <line x1="11" x2="1" y1="1" y2="11" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <input
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                          />
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <TextField
                            className="flex-1 min-w-0 sm:min-w-40 flex flex-col gap-1.5"
                            value={ctaText}
                            onChange={setCtaText}
                          >
                            <Label>Testo bottone</Label>
                            <Input placeholder="Es: Ascolta ora" />
                            <Description>
                              Lascia vuoto per non includere bottone
                            </Description>
                          </TextField>
                          <TextField
                            className="flex-1 min-w-0 sm:min-w-48 flex flex-col gap-1.5"
                            type="text"
                            value={ctaUrl}
                            onChange={setCtaUrl}
                          >
                            <Label>Link bottone</Label>
                            <Input placeholder="Inserisci il link" />
                          </TextField>
                        </div>
                      </div>

                      {/* Email preview */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-default-400">
                            Anteprima email
                          </p>
                          <div className="inline-flex items-center gap-0.5 rounded-lg border border-default-200 p-0.5">
                            <button
                              aria-pressed={!previewDark}
                              className={clsx(
                                "px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer",
                                previewDark
                                  ? "text-default-400 hover:text-default-500"
                                  : "bg-default-200 text-foreground",
                              )}
                              type="button"
                              onClick={() => setPreviewDark(false)}
                            >
                              Chiaro
                            </button>
                            <button
                              aria-pressed={previewDark}
                              className={clsx(
                                "px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer",
                                previewDark
                                  ? "bg-default-200 text-foreground"
                                  : "text-default-400 hover:text-default-500",
                              )}
                              type="button"
                              onClick={() => setPreviewDark(true)}
                            >
                              Scuro
                            </button>
                          </div>
                        </div>
                        <iframe
                          className="w-full h-90 sm:h-130 rounded-lg border border-default-200"
                          srcDoc={buildBroadcastHtml(
                            true,
                            previewDark ? "dark" : "light",
                          )}
                          title="Anteprima email"
                        />
                      </div>

                      {/* Send */}
                      {!confirmSend ? (
                        <Button
                          fullWidth
                          className="rounded-xl font-semibold"
                          isDisabled={!composerValid || broadcastLoading}
                          size="lg"
                          variant="danger"
                          onPress={() =>
                            handleSend(
                              isIndividuale
                                ? selectedSubscribers.map((s) => s.id)
                                : undefined,
                            )
                          }
                        >
                          {broadcastLoading ? (
                            <Spinner size="sm" />
                          ) : isIndividuale ? (
                            `Invia a ${selectedSubscribers.length} destinatari`
                          ) : (
                            "Invia a tutti"
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3 flex-wrap justify-center">
                          <span className="text-sm text-danger font-medium">
                            Confermi l&apos;invio?
                          </span>
                          <Button
                            className="rounded-xl"
                            isDisabled={broadcastLoading}
                            size="sm"
                            variant="danger"
                            onPress={() =>
                              handleSend(
                                isIndividuale
                                  ? selectedSubscribers.map((s) => s.id)
                                  : undefined,
                              )
                            }
                          >
                            {broadcastLoading ? (
                              <Spinner size="sm" />
                            ) : (
                              "Sì, invia"
                            )}
                          </Button>
                          <Button
                            className="rounded-xl"
                            size="sm"
                            variant="outline"
                            onPress={() => setConfirmSend(false)}
                          >
                            Annulla
                          </Button>
                        </div>
                      )}

                      {!isIndividuale && (
                        <p className="text-xs text-default-400 text-center">
                          {dryCount !== null ? (
                            <>
                              <span className="text-success font-semibold">
                                {dryCount}
                              </span>{" "}
                              iscritti riceveranno questa email
                            </>
                          ) : (
                            "Calcolo destinatari…"
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

const STAT_TEXT_CLASS: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  default: "text-default-700",
  primary: "text-primary",
};

function StatCard({
  label,
  value,
  color = "default",
}: {
  label: string;
  value: number | undefined;
  color?: "success" | "warning" | "danger" | "default" | "primary";
}) {
  return (
    <div className="rounded-xl border border-default-100 bg-default-50 p-3 flex flex-col gap-1">
      <span className="text-xs text-default-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold ${STAT_TEXT_CLASS[color]}`}>
        {value ?? "–"}
      </span>
    </div>
  );
}
