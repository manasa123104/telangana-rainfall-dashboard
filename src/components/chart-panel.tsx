"use client";

import { useRef, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { downloadChartPng } from "@/lib/download-chart";

type ChartPanelProps = {
  title: string;
  description: string;
  filename: string;
  icon?: ReactNode;
  wide?: boolean;
  children: ReactNode;
  canDownload?: boolean;
};

export function ChartPanel({
  title,
  description,
  filename,
  icon,
  wide = false,
  children,
  canDownload = true,
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
      await downloadChartPng(node, filename);
    } catch {
      setError("Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={wide ? "panel panel-wide" : "panel"}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="panel-actions">
          {canDownload ? (
            <button
              type="button"
              className="chart-download-btn"
              onClick={handleDownload}
              disabled={busy}
              aria-label={`Download ${title} as PNG`}
              title={error ?? "Download PNG"}
            >
              <Download aria-hidden />
              <span>{busy ? "Saving…" : "Download"}</span>
            </button>
          ) : null}
          {icon}
        </div>
      </div>
      <div ref={exportRef} className="chart-export-root">
        {children}
      </div>
      {error ? (
        <p className="chart-download-error" role="status">
          {error}
        </p>
      ) : null}
    </article>
  );
}
