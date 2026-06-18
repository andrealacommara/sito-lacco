import type { Session } from "@supabase/supabase-js";
import type {
  AdminStatsResponse,
  AdminSubscriber,
  AdminSubscribersResponse,
  AdminSyncResendResponse,
  AdminUnsubscribeResponse,
  BroadcastBody,
  BroadcastResponse,
} from "@/types/api";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { Select, SelectItem } from "@heroui/select";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";
import { Helmet } from "react-helmet-async";

import RichTextEditor from "@/components/richTextEditor";
import DefaultLayout from "@/layouts/default";
import { supabase, EF_BASE } from "@/lib/supabase";
import { broadcastEmailHtml } from "@/emails/templates";

type View = "login" | "check-email" | "dashboard";
type Tab = "subscribers" | "broadcast" | "individuale";
type FilterStatus = "" | "confirmed" | "unsubscribed" | "bounced";
type SortBy = "email" | "status" | "source" | "createdAt";
type SortDir = "asc" | "desc";

const ADMIN_EMAIL = "management@lacco.it";

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
        addToast({ title: "Errore nel caricamento iscritti", color: "danger" });
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
        addToast({
          title: `Sincronizzato: ${data.updated ?? 0} aggiornati su ${data.checked ?? 0} contatti Resend`,
          color: "success",
        });
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
        addToast({
          title: data.error ?? "Errore sincronizzazione",
          color: "danger",
        });
      }
    } catch {
      addToast({ title: "Errore di rete", color: "danger" });
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
        addToast({
          title: `Disiscritti ${data.updated ?? 0} iscritti`,
          color: "success",
        });
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
        addToast({
          title: data.error ?? "Errore durante la disiscrizione",
          color: "danger",
        });
      }
    } catch {
      addToast({ title: "Errore di rete", color: "danger" });
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });

    setLoginLoading(false);
    if (error) {
      addToast({ title: error.message, color: "danger" });
    } else {
      setView("check-email");
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (
      !addEmail.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addEmail.trim())
    ) {
      addToast({ title: "Email non valida", color: "danger" });

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
        addToast({ title: "Iscritto aggiunto", color: "success" });
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
        addToast({
          title: data.error ?? "Errore durante l'aggiunta",
          color: "danger",
        });
      }
    } catch {
      addToast({ title: "Errore di rete", color: "danger" });
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
      addToast({ title: "Errore upload immagine", color: "danger" });
    } else {
      const { data } = supabase.storage
        .from("broadcast-images")
        .getPublicUrl(path);

      setImagePublicUrl(data.publicUrl);
    }
    setImageUploading(false);
    e.target.value = "";
  };

  const buildBroadcastHtml = (preview = false) =>
    broadcastEmailHtml({
      body: emailBody || "Corpo dell'email…",
      imageUrl: imagePublicUrl || undefined,
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      unsubscribeUrl: "{{{ RESEND_UNSUBSCRIBE_URL }}}",
      preview,
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
      addToast({ title: "Errore dry run", color: "danger" });
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
      addToast({
        title: "Compila oggetto e testo della mail",
        color: "danger",
      });

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

        addToast({
          title: recipientIds
            ? `Inviato a ${data.sent ?? 0} destinatari`
            : `Inviato a ${data.recipientCount ?? 0} iscritti${syncNote}`,
          color: "success",
        });
        setSubject("");
        setEmailBody("");
        setImagePublicUrl("");
        setCtaText("");
        setCtaUrl("");
        setDryCount(null);
        if (recipientIds) setSelectedSubscribers([]);
      } else {
        addToast({ title: data.error ?? "Errore invio", color: "danger" });
      }
    } catch {
      addToast({ title: "Errore di rete", color: "danger" });
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
          <div className="bg-background/60 backdrop-blur-md border border-default-100 rounded-2xl px-10 py-10 flex flex-col items-center gap-6">
            <h1 className="text-xl font-semibold">Area admin</h1>
            <form onSubmit={handleLogin}>
              <Button color="danger" isLoading={loginLoading} type="submit">
                {loginLoading ? "" : "Accedi"}
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
          <div className="bg-background/60 backdrop-blur-md border border-default-100 rounded-2xl px-10 py-10 flex flex-col items-center gap-4 text-center">
            <p className="text-lg font-medium">Controlla la tua email</p>
            <p className="text-default-500 text-sm">
              Controlla la tua casella di posta.
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
        <div className="max-w-3xl mx-auto mb-2 flex justify-end">
          <Button
            color="danger"
            size="sm"
            variant="flat"
            onPress={() => supabase.auth.signOut()}
          >
            Esci
          </Button>
        </div>
        <div className="bg-white/20 backdrop-blur-md border border-default-100 rounded-2xl p-6 max-w-3xl mx-auto flex flex-col gap-6">
        {/* Tab bar */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <Button
              className="font-semibold shrink-0"
              color={tab === "subscribers" ? "danger" : "default"}
              size="sm"
              variant={tab === "subscribers" ? "solid" : "bordered"}
              onPress={() => switchTab("subscribers")}
            >
              Iscritti
            </Button>
            <Button
              className="font-semibold shrink-0"
              color={tab === "broadcast" ? "danger" : "default"}
              size="sm"
              variant={tab === "broadcast" ? "solid" : "bordered"}
              onPress={() => switchTab("broadcast")}
            >
              Broadcast
            </Button>
            <Button
              className="font-semibold shrink-0"
              color={tab === "individuale" ? "danger" : "default"}
              size="sm"
              variant={tab === "individuale" ? "solid" : "bordered"}
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
            <Input
              isClearable
              className="w-full"
              placeholder="Cerca per email o nome…"
              size="sm"
              startContent={
                <svg
                  className="text-default-400"
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
              }
              value={searchInput}
              variant="bordered"
              onClear={() => setSearchInput("")}
              onValueChange={setSearchInput}
            />

            {/* Status filter + azioni */}
            <div className="flex items-center justify-between gap-2">
              <Select
                aria-label="Filtra per stato"
                className="w-40"
                selectedKeys={[filterStatus || "all"]}
                size="sm"
                variant="bordered"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string | undefined;

                  setFilterStatus(
                    (value === "all" ? "" : (value ?? "")) as FilterStatus,
                  );
                  setPage(1);
                }}
              >
                <SelectItem key="all">Tutti</SelectItem>
                <SelectItem key="confirmed">Confermati</SelectItem>
                <SelectItem key="unsubscribed">Disiscritti</SelectItem>
                <SelectItem key="bounced">Rimbalzati</SelectItem>
              </Select>
              <Button
                color="secondary"
                isLoading={syncLoading}
                size="sm"
                variant="flat"
                onPress={handleSyncResend}
              >
                {!syncLoading && (
                  <>
                    Ricarica
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <path d="M21 2v6h-6" />
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                      <path d="M3 22v-6h6" />
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    </svg>
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
                      className="flex-1"
                      color="default"
                      size="sm"
                      variant="flat"
                      onPress={() => setSelectedSubscribers([])}
                    >
                      Deseleziona
                    </Button>
                    <Button
                      className="flex-1 font-semibold"
                      color="primary"
                      size="sm"
                      onPress={() => switchTab("individuale")}
                    >
                      Scrivi
                    </Button>
                    <Button
                      className="flex-1"
                      color="danger"
                      isDisabled={unsubscribableSelected.length === 0}
                      size="sm"
                      variant="flat"
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
                        color="danger"
                        isLoading={unsubscribeLoading}
                        size="sm"
                        onPress={handleUnsubscribeSelected}
                      >
                        Sì, disiscrivi
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
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
                  isIndeterminate={someOnPageSelected}
                  isSelected={allOnPageSelected}
                  size="sm"
                  onValueChange={toggleSelectAllOnPage}
                />
                <button
                  className="flex-1 flex items-center gap-1 text-left hover:text-default-600"
                  type="button"
                  onClick={() => handleSort("email")}
                >
                  Iscritto
                  {sortBy === "email" && (
                    <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                  )}
                </button>
                <button
                  className="flex items-center gap-1 hover:text-default-600"
                  type="button"
                  onClick={() => handleSort("status")}
                >
                  Stato
                  {sortBy === "status" && (
                    <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                  )}
                </button>
                <button
                  className="hidden sm:flex items-center gap-1 w-24 shrink-0 hover:text-default-600"
                  type="button"
                  onClick={() => handleSort("source")}
                >
                  Fonte
                  {sortBy === "source" && (
                    <span>{sortDir === "asc" ? "↓" : "↑"}</span>
                  )}
                </button>
                <button
                  className="flex items-center justify-end gap-1 w-20 shrink-0 hover:text-default-600"
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
                    className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg border-b border-default-100 text-sm hover:bg-default-50 transition-colors"
                  >
                    <Checkbox
                      isSelected={selectedSubscribers.some(
                        (sel) => sel.id === s.id,
                      )}
                      size="sm"
                      onValueChange={() => toggleSelectSubscriber(s)}
                    />
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
                      variant="flat"
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
                  isDisabled={page <= 1}
                  size="sm"
                  variant="bordered"
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
                  isDisabled={page >= totalPages}
                  size="sm"
                  variant="bordered"
                  onPress={() => setPage((p) => p + 1)}
                >
                  →
                </Button>
                <Select
                  aria-label="Contatti per pagina"
                  className="w-20 ml-1"
                  selectedKeys={[String(pageSize)]}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];

                    if (value) {
                      setPageSize(Number(value));
                      setPage(1);
                    }
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={String(n)} textValue={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </Select>
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
                  <Input
                    className="flex-1 min-w-48"
                    label="Email"
                    labelPlacement="outside"
                    placeholder="nome@email.com"
                    size="sm"
                    type="email"
                    value={addEmail}
                    variant="bordered"
                    onValueChange={setAddEmail}
                  />
                  <Input
                    className="flex-1 min-w-32"
                    label="Nome"
                    labelPlacement="outside"
                    placeholder="Nome"
                    size="sm"
                    type="text"
                    value={addFirstName}
                    variant="bordered"
                    onValueChange={setAddFirstName}
                  />
                  <Input
                    label="Data consenso"
                    labelPlacement="outside"
                    size="sm"
                    type="date"
                    value={addConsentDate}
                    variant="bordered"
                    onValueChange={setAddConsentDate}
                  />
                </div>
                <Button
                  className="font-semibold"
                  color="danger"
                  isLoading={addLoading}
                  size="lg"
                  type="submit"
                >
                  {addLoading ? "" : "Aggiungi"}
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
                      <Chip
                        key={s.id}
                        size="sm"
                        variant="flat"
                        onClose={() => toggleSelectSubscriber(s)}
                      >
                        {s.email}
                      </Chip>
                    ))}
                  </div>
                )}

                {/* Composer */}
                <div className="flex flex-col gap-4">
                  <Input
                    label="Oggetto email"
                    labelPlacement="outside"
                    placeholder="Es: Nuovo singolo in arrivo"
                    value={subject}
                    variant="bordered"
                    onValueChange={setSubject}
                  />
                  <RichTextEditor
                    placeholder="Scrivi il corpo della mail…"
                    value={emailBody}
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
                    <Input
                      className="flex-1 min-w-40"
                      description="Lascia vuoto per non includere bottone"
                      label="Testo bottone"
                      labelPlacement="outside"
                      placeholder="Es: Ascolta ora"
                      value={ctaText}
                      variant="bordered"
                      onValueChange={setCtaText}
                    />
                    <Input
                      className="flex-1 min-w-48"
                      label="Link bottone"
                      labelPlacement="outside"
                      placeholder="https://lacco.it/…"
                      type="url"
                      value={ctaUrl}
                      variant="bordered"
                      onValueChange={setCtaUrl}
                    />
                  </div>
                </div>

                {/* Email preview */}
                <div>
                  <p className="text-xs text-default-400 mb-2">
                    Anteprima email
                  </p>
                  <iframe
                    className="w-full rounded-lg border border-default-200"
                    srcDoc={buildBroadcastHtml(true)}
                    style={{ height: 520 }}
                    title="Anteprima email"
                  />
                </div>

                {/* Send */}
                {!confirmSend ? (
                  <Button
                    fullWidth
                    className="font-semibold"
                    color="danger"
                    isDisabled={!composerValid}
                    isLoading={broadcastLoading}
                    size="lg"
                    onPress={() =>
                      handleSend(
                        isIndividuale
                          ? selectedSubscribers.map((s) => s.id)
                          : undefined,
                      )
                    }
                  >
                    {isIndividuale
                      ? `Invia a ${selectedSubscribers.length} destinatari`
                      : "Invia a tutti"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <span className="text-sm text-danger font-medium">
                      Confermi l'invio?
                    </span>
                    <Button
                      color="danger"
                      isLoading={broadcastLoading}
                      size="sm"
                      onPress={() =>
                        handleSend(
                          isIndividuale
                            ? selectedSubscribers.map((s) => s.id)
                            : undefined,
                        )
                      }
                    >
                      Sì, invia
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
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
