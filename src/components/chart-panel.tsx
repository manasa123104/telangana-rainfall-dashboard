"use client";

import { useRef, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { downloadChartPng } from "@/lib/download-chart";

type ChartPanelProps = {
  title?: string;
  description?: string;
  exportLabels?: string;
  filename: string;
  icon?: ReactNode;
  wide?: boolean;
  children: ReactNode;
  canDownload?: boolean;
  /** Skip outer article chrome — use inside an existing panel. */
  embedded?: boolean;
  /** Extra controls rendered in the panel header actions. */
  actions?: ReactNode;
  /** Full-width toolbar between the head and chart body. */
  toolbar?: ReactNode;
};

export function ChartPanel({
  title,
  description,
  exportLabels,
  filename,
  icon,
  wide = false,
  children,
  canDownload = true,
  embedded = false,
  actions,
  toolbar,
}: ChartPanelProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    const node = exportRef.current;
    if (!node || !canDownload || busy) return;
    setBusy(true);
    setError(null);
    try {
      await downloadChartPng(node, filename, [title || "Rainfall chart", description, exportLabels].filter((label): label is string => Boolean(label)));
    } catch {
      setError("Download failed");
    } finally {
      setBusy(false);
    }
  }

  const downloadButton =
    canDownload ? (
      <button
        type="button"
        className="chart-download-btn"
        onClick={handleDownload}
        disabled={busy}
        aria-label={`Download ${title || "chart"} as PNG`}
        title={error ?? "Download PNG"}
      >
        <Download aria-hidden />
        <span>{busy ? "Saving…" : "Download"}</span>
      </button>
    ) : null;

  const body = (
    <>
      <div ref={exportRef} className="chart-export-root">
        {children}
      </div>
      {error ? (
        <p className="chart-download-error" role="status">
          {error}
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className="chart-embedded">
        {(downloadButton || actions) && (
          <div className="panel-actions chart-embedded-actions">
            {actions}
            {downloadButton}
            {icon}
          </div>
        )}
        {body}
      </div>
    );
  }

  return (
    <article className={wide ? "panel panel-wide" : "panel"}>
      <div className="panel-head">
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        <div className="panel-actions">
          {actions}
          {downloadButton}
          {icon}
        </div>
      </div>
      {toolbar ? <div className="panel-toolbar">{toolbar}</div> : null}
      {body}
    </article>
  );
}
