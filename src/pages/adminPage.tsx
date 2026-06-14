import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import type { Session } from "@supabase/supabase-js";

import DefaultLayout from "@/layouts/default";
import { supabase, EF_BASE } from "@/lib/supabase";
import { announcementEmailHtml } from "@/emails/templates";
import type {
  AdminSubscriber,
  AdminSubscribersResponse,
  BroadcastBody,
  BroadcastResponse,
} from "@/types/api";

type View = "login" | "check-email" | "dashboard";
type Tab = "subscribers" | "broadcast";
type FilterStatus = "" | "pending" | "confirmed" | "unsubscribed" | "bounced";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "confermato",
  pending: "in attesa",
  unsubscribed: "disiscritto",
  bounced: "rimbalzato",
};

const STATUS_CLASS: Record<string, string> = {
  confirmed: "text-success",
  pending: "text-warning",
  unsubscribed: "text-default-400",
  bounced: "text-danger",
};

const PAGE_SIZE = 50;

export default function AdminPage() {
  const [view, setView] = useState<View>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("subscribers");

  // Login
  const [loginEmail, setLoginEmail] = useState("andrealacommara@icloud.com");
  const [loginLoading, setLoginLoading] = useState(false);

  // Subscribers list
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("");
  const [subsLoading, setSubsLoading] = useState(false);

  // Add subscriber
  const [addEmail, setAddEmail] = useState("");
  const [addFirstName, setAddFirstName] = useState("");
  const [addConsentDate, setAddConsentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [addLoading, setAddLoading] = useState(false);

  // Broadcast
  const [subject, setSubject] = useState("");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseUrl, setReleaseUrl] = useState("");
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

  // ── Subscribers ─────────────────────────────────────────────────────────────

  const fetchSubscribers = useCallback(
    async (sess: Session, p: number, fs: FilterStatus) => {
      setSubsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (fs) params.set("status", fs);
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
      fetchSubscribers(session, page, filterStatus);
    }
  }, [view, tab, session, page, filterStatus, fetchSubscribers]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
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
        await fetchSubscribers(session, page, filterStatus);
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

  const previewHtml = announcementEmailHtml({
    releaseTitle: releaseTitle || "Titolo brano",
    releaseUrl: releaseUrl || "#",
    unsubscribeUrl: "{{{ RESEND_UNSUBSCRIBE_URL }}}",
  });

  const handleDryRun = async () => {
    if (!session) return;
    setBroadcastLoading(true);
    try {
      const body: BroadcastBody = {
        subject: subject || "(bozza)",
        htmlBody: previewHtml,
        dry: true,
      };
      const res = await fetch(`${EF_BASE}/admin-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as BroadcastResponse;
      setDryCount(data.recipientCount ?? 0);
    } catch {
      addToast({ title: "Errore dry run", color: "danger" });
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!subject.trim() || !releaseTitle.trim() || !releaseUrl.trim()) {
      addToast({ title: "Compila oggetto, titolo brano e link", color: "danger" });
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
      const html = announcementEmailHtml({
        releaseTitle: releaseTitle.trim(),
        releaseUrl: releaseUrl.trim(),
        unsubscribeUrl: "{{{ RESEND_UNSUBSCRIBE_URL }}}",
      });
      const body: BroadcastBody = { subject: subject.trim(), htmlBody: html };
      const res = await fetch(`${EF_BASE}/admin-broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as BroadcastResponse;
      if (data.ok) {
        addToast({
          title: `Inviato a ${data.recipientCount ?? 0} iscritti`,
          color: "success",
        });
        setSubject("");
        setReleaseTitle("");
        setReleaseUrl("");
        setDryCount(null);
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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
          <h1 className="text-xl font-semibold">Area admin</h1>
          <form
            className="flex flex-col gap-4 w-full max-w-xs"
            onSubmit={handleLogin}
          >
            <Input
              label="Email"
              labelPlacement="outside"
              placeholder="andrealacommara@icloud.com"
              type="email"
              value={loginEmail}
              variant="bordered"
              onValueChange={setLoginEmail}
            />
            <Button
              color="danger"
              fullWidth
              isLoading={loginLoading}
              type="submit"
            >
              {loginLoading ? "" : "Invia magic link"}
            </Button>
          </form>
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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-4">
          <p className="text-lg font-medium">Controlla la tua email</p>
          <p className="text-default-500 text-sm">
            Ti ho inviato un link di accesso a {loginEmail}.
          </p>
        </div>
      </DefaultLayout>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  return (
    <DefaultLayout>
      <Helmet>
        <title>Admin | Lacco</title>
        <meta content="noindex, nofollow" name="robots" />
      </Helmet>
      <div className="flex flex-col gap-6 py-8 max-w-3xl mx-auto px-4">

        {/* Tab bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              color={tab === "subscribers" ? "danger" : "default"}
              size="sm"
              variant={tab === "subscribers" ? "solid" : "bordered"}
              onPress={() => setTab("subscribers")}
            >
              Iscritti{total > 0 ? ` (${total})` : ""}
            </Button>
            <Button
              color={tab === "broadcast" ? "danger" : "default"}
              size="sm"
              variant={tab === "broadcast" ? "solid" : "bordered"}
              onPress={() => setTab("broadcast")}
            >
              Broadcast
            </Button>
          </div>
          <Button
            size="sm"
            variant="light"
            onPress={() => supabase.auth.signOut()}
          >
            Esci
          </Button>
        </div>

        {/* ── SUBSCRIBERS TAB ─────────────────────────────────────────────── */}
        {tab === "subscribers" && (
          <div className="flex flex-col gap-6">

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  ["", "Tutti"],
                  ["confirmed", "Confermati"],
                  ["pending", "In attesa"],
                  ["unsubscribed", "Discritti"],
                  ["bounced", "Rimbalzati"],
                ] as [FilterStatus, string][]
              ).map(([val, label]) => (
                <Button
                  key={val || "all"}
                  color={filterStatus === val ? "danger" : "default"}
                  size="sm"
                  variant={filterStatus === val ? "solid" : "bordered"}
                  onPress={() => {
                    setFilterStatus(val);
                    setPage(1);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* List */}
            {subsLoading ? (
              <p className="text-default-400 text-sm">Caricamento…</p>
            ) : subscribers.length === 0 ? (
              <p className="text-default-400 text-sm">Nessun iscritto trovato.</p>
            ) : (
              <div className="flex flex-col">
                {subscribers.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 py-2.5 border-b border-default-100 text-sm"
                  >
                    <span className="font-medium min-w-0 break-all">{s.email}</span>
                    {s.firstName && (
                      <span className="text-default-500">{s.firstName}</span>
                    )}
                    <span
                      className={`text-xs font-medium ${STATUS_CLASS[s.status] ?? ""}`}
                    >
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                    <span className="text-xs text-default-400">{s.source}</span>
                    {s.releaseSlug && (
                      <span className="text-xs text-default-400">
                        {s.releaseSlug}
                      </span>
                    )}
                    <span className="text-xs text-default-400 ml-auto">
                      {new Date(s.createdAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > PAGE_SIZE && (
              <div className="flex items-center gap-3">
                <Button
                  isDisabled={page <= 1}
                  size="sm"
                  variant="bordered"
                  onPress={() => setPage((p) => p - 1)}
                >
                  ← Prec
                </Button>
                <span className="text-sm text-default-500">
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                <Button
                  isDisabled={page >= Math.ceil(total / PAGE_SIZE)}
                  size="sm"
                  variant="bordered"
                  onPress={() => setPage((p) => p + 1)}
                >
                  Succ →
                </Button>
              </div>
            )}

            {/* Add manually */}
            <div className="border-t border-default-100 pt-6">
              <h2 className="text-sm font-semibold mb-4">
                Aggiungi manualmente
              </h2>
              <form className="flex flex-col gap-3" onSubmit={handleAddSubscriber}>
                <div className="flex gap-3 flex-wrap">
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
                    label="Nome (opz.)"
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
                  className="self-start"
                  color="danger"
                  isLoading={addLoading}
                  size="sm"
                  type="submit"
                >
                  {addLoading ? "" : "Aggiungi"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── BROADCAST TAB ───────────────────────────────────────────────── */}
        {tab === "broadcast" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Input
                label="Oggetto email"
                labelPlacement="outside"
                placeholder="Es: Nuovo singolo di Lacco"
                value={subject}
                variant="bordered"
                onValueChange={setSubject}
              />
              <Input
                label="Titolo brano"
                labelPlacement="outside"
                placeholder="Es: Bella al buio"
                value={releaseTitle}
                variant="bordered"
                onValueChange={setReleaseTitle}
              />
              <Input
                label="Link streaming"
                labelPlacement="outside"
                placeholder="https://lacco.it/bella-al-buio"
                type="url"
                value={releaseUrl}
                variant="bordered"
                onValueChange={setReleaseUrl}
              />
            </div>

            {/* Email preview */}
            <div>
              <p className="text-xs text-default-400 mb-2">Anteprima email</p>
              <iframe
                className="w-full rounded-lg border border-default-200"
                srcDoc={previewHtml}
                style={{ height: 500 }}
                title="Anteprima email"
              />
            </div>

            {/* Dry run */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                isLoading={broadcastLoading}
                size="sm"
                variant="bordered"
                onPress={handleDryRun}
              >
                Conta destinatari
              </Button>
              {dryCount !== null && (
                <span className="text-sm text-default-500">
                  {dryCount} iscritti confermati
                </span>
              )}
            </div>

            {/* Send */}
            {!confirmSend ? (
              <Button
                color="danger"
                isDisabled={
                  !subject.trim() || !releaseTitle.trim() || !releaseUrl.trim()
                }
                isLoading={broadcastLoading}
                onPress={handleSendBroadcast}
              >
                Invia a tutti
              </Button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-danger font-medium">
                  Sicuro? L'invio è irreversibile.
                </span>
                <Button
                  color="danger"
                  isLoading={broadcastLoading}
                  size="sm"
                  onPress={handleSendBroadcast}
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
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
