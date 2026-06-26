import { useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  TextField,
  Label,
  Input,
  toast,
} from "@heroui/react";

import RichTextEditor from "@/components/richTextEditor";
import {
  renderTemplate,
  renderTemplateToBlob,
  downloadBlob,
  type TemplateOptions,
} from "@/lib/templateRenderer";

type FormatKey = "story" | "post-4x5" | "post-1x1";

interface Format {
  key: FormatKey;
  label: string;
  width: number;
  height: number;
  /** Logo width as a fraction of canvas width — smaller on shorter formats. */
  logoScale: number;
}

const FORMATS: Format[] = [
  {
    key: "story",
    label: "Story 9:16",
    width: 1080,
    height: 1920,
    logoScale: 0.3,
  },
  {
    key: "post-4x5",
    label: "Post 4:5",
    width: 1080,
    height: 1350,
    logoScale: 0.27,
  },
  {
    key: "post-1x1",
    label: "Post 1:1",
    width: 1080,
    height: 1080,
    logoScale: 0.22,
  },
];

export default function TemplateStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [format, setFormat] = useState<FormatKey>("story");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentLogo, setAccentLogo] = useState(false);
  const [accentTitle, setAccentTitle] = useState(false);
  const [accentWaves, setAccentWaves] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showPattern, setShowPattern] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Verifichiamo a runtime se il pannello di condivisione nativo con file è
  // disponibile, invece di indovinare dal solo touch: alcuni browser supportano
  // navigator.share ma non con files, e canShare() lo distingue. In prerender
  // (Node) navigator è assente → resta false. Inizializzatore lazy, niente effect.
  const [canUseNativeShare] = useState(() => {
    if (typeof navigator === "undefined" || !navigator.canShare) return false;
    try {
      const probe = new File([new Uint8Array([0xff, 0xd8])], "probe.jpg", {
        type: "image/jpeg",
      });

      return navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  });

  const current = FORMATS.find((f) => f.key === format) ?? FORMATS[0];

  const buildOptions = (f: Format): TemplateOptions => ({
    width: f.width,
    height: f.height,
    theme,
    accentLogo,
    accentTitle,
    accentWaves,
    showLogo,
    showPattern,
    logoScale: f.logoScale,
    title,
    bodyHtml,
  });

  // Live preview — re-render on any option change.
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;

    if (!canvas) return;

    renderTemplate(canvas, buildOptions(current)).catch(() => {
      if (!cancelled) toast.danger("Errore nel rendering dell'anteprima");
    });

    return () => {
      cancelled = true;
    };
  }, [
    format,
    theme,
    accentLogo,
    accentTitle,
    accentWaves,
    showLogo,
    showPattern,
    title,
    bodyHtml,
  ]);

  const fileName = (f: Format) => `lacco-${f.key}-${theme}.jpg`;

  // Scarica (desktop e mobile): file separati nel filesystem/Download.
  const output = async (formats: Format[]) => {
    setDownloading(true);
    try {
      const files = await Promise.all(
        formats.map(async (f) => {
          const blob = await renderTemplateToBlob(buildOptions(f));

          return new File([blob], fileName(f), { type: "image/jpeg" });
        }),
      );

      for (const f of files) {
        downloadBlob(f, f.name);
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success(
        formats.length > 1 ? "Immagini scaricate" : "Immagine scaricata",
      );
    } catch {
      toast.danger("Errore durante il salvataggio");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = () => output([current]);
  const handleDownloadAll = () => output(FORMATS);

  // Salva in galleria (solo mobile, solo se l'API è disponibile): usiamo
  // direttamente il canvas già renderizzato in anteprima per restare il più
  // vicino possibile al tap dell'utente — necessario perché alcuni browser
  // revocano il permesso di condivisione se passa troppo tempo dal gesture.
  const handleSaveToGallery = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    setDownloading(true);
    try {
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          "image/jpeg",
          0.92,
        ),
      );
      const file = new File([blob], fileName(current), { type: "image/jpeg" });

      await navigator.share({ files: [file] });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // L'utente ha chiuso il pannello — nessun messaggio necessario.
        return;
      }
      console.warn("Condivisione nativa non riuscita:", e);
      toast.danger(
        "Non è stato possibile aprire la condivisione. Usa 'Scarica' e poi salva l'immagine dalla galleria/download del telefono.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Controls ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 w-full max-w-sm mx-auto lg:mx-0 lg:w-80 shrink-0">
          {/* Format */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-danger uppercase tracking-wide text-center lg:text-left">
              Formato
            </span>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center lg:justify-start">
              {FORMATS.map((f) => (
                <Button
                  key={f.key}
                  className="rounded-xl font-semibold shrink-0"
                  size="sm"
                  variant={format === f.key ? "danger" : "outline"}
                  onPress={() => setFormat(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <Checkbox isSelected={showLogo} onChange={setShowLogo}>
              <CheckboxContent>
                <CheckboxControl>
                  <CheckboxIndicator />
                </CheckboxControl>
                <span>Logo in alto</span>
              </CheckboxContent>
            </Checkbox>
            <Checkbox isSelected={showPattern} onChange={setShowPattern}>
              <CheckboxContent>
                <CheckboxControl>
                  <CheckboxIndicator />
                </CheckboxControl>
                <span>Pattern di sfondo</span>
              </CheckboxContent>
            </Checkbox>
            {format === "story" && (
              <Checkbox isSelected={showGuides} onChange={setShowGuides}>
                <CheckboxContent>
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <span>Guide safe-area (solo anteprima)</span>
                </CheckboxContent>
              </Checkbox>
            )}
          </div>

          {/* Red accent — pick what turns red */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-danger uppercase tracking-wide text-center lg:text-left">
              Accento rosso
            </span>
            <div className="flex flex-col gap-3">
              <Checkbox isSelected={accentLogo} onChange={setAccentLogo}>
                <CheckboxContent>
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <span>Logo</span>
                </CheckboxContent>
              </Checkbox>
              <Checkbox isSelected={accentTitle} onChange={setAccentTitle}>
                <CheckboxContent>
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <span>Titolo</span>
                </CheckboxContent>
              </Checkbox>
              <Checkbox isSelected={accentWaves} onChange={setAccentWaves}>
                <CheckboxContent>
                  <CheckboxControl>
                    <CheckboxIndicator />
                  </CheckboxControl>
                  <span>Onde</span>
                </CheckboxContent>
              </Checkbox>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-3">
            <TextField
              className="flex flex-col gap-1.5"
              value={title}
              variant="secondary"
              onChange={setTitle}
            >
              <Label>Titolo (opzionale)</Label>
              <Input placeholder="Inserisci un titolo" />
            </TextField>
            <RichTextEditor
              label="Corpo (opzionale)"
              placeholder="Scrivi il testo da inserire"
              value={bodyHtml}
              variant="flat"
              onChange={setBodyHtml}
            />
          </div>
        </div>

        {/* ── Preview ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center gap-4 min-w-0">
          <div className="max-w-full rounded-2xl border border-default-200 bg-default-50 p-3 shadow-md ring-1 ring-black/5">
            <div className="relative inline-block max-w-full">
              <canvas
                ref={canvasRef}
                className="block h-auto w-auto max-h-[70vh] max-w-full rounded-lg ring-1 ring-default-300 shadow-sm"
                style={{ aspectRatio: `${current.width} / ${current.height}` }}
              />
              {format === "story" && showGuides && (
                <>
                  {/* Top zone covered by IG profile / story UI (~13%) */}
                  <div className="absolute inset-x-0 top-0 h-[13%] bg-danger/10 border-b border-dashed border-danger/60 pointer-events-none" />
                  {/* Bottom zone covered by reply bar / actions (~13%) */}
                  <div className="absolute inset-x-0 bottom-0 h-[13%] bg-danger/10 border-t border-dashed border-danger/60 pointer-events-none" />
                </>
              )}
            </div>
          </div>
          {/* Theme switcher*/}
          <div className="flex gap-1 sm:gap-2 justify-center">
            <Button
              className="rounded-xl font-semibold"
              size="sm"
              variant={theme === "dark" ? "danger" : "outline"}
              onPress={() => setTheme("dark")}
            >
              Scuro
            </Button>
            <Button
              className="rounded-xl font-semibold"
              size="sm"
              variant={theme === "light" ? "danger" : "outline"}
              onPress={() => setTheme("light")}
            >
              Chiaro
            </Button>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
        {canUseNativeShare && (
          <Button
            className="rounded-xl font-semibold w-full sm:w-auto"
            isDisabled={downloading}
            variant="danger"
            onPress={handleSaveToGallery}
          >
            Salva in galleria
          </Button>
        )}
        <Button
          className="rounded-xl font-semibold w-full sm:w-auto"
          isDisabled={downloading}
          variant="primary"
          onPress={handleDownload}
        >
          Scarica
        </Button>
        <Button
          className="rounded-xl font-semibold w-full sm:w-auto"
          isDisabled={downloading}
          variant="outline"
          onPress={handleDownloadAll}
        >
          Scarica tutti
        </Button>
      </div>
    </div>
  );
}
