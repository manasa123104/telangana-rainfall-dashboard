"use client";

import { toPng } from "html-to-image";

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Export a chart panel node to PNG. Prefers html-to-image; falls back to
 * serializing the first SVG when that fails (e.g. filter / CORS edge cases).
 */
export async function downloadChartPng(
  node: HTMLElement,
  filename: string,
  labels: string[] = [],
): Promise<void> {
  await document.fonts.ready;
  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      filter: (el) => {
        if (!(el instanceof HTMLElement)) return true;
        return !el.classList.contains("chart-download-btn");
      },
    });
    await downloadLabeledImage(dataUrl, filename, labels);
    return;
  } catch {
    // Fall through to SVG serialize.
  }

  const svg = node.querySelector("svg");
  if (!svg) {
    throw new Error("Chart is not ready to download yet.");
  }

  const clone = svg.cloneNode(true) as SVGElement;
  if (!clone.getAttribute("xmlns")) {
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width) || Number(svg.getAttribute("width")) || 800);
  const height = Math.max(1, Math.round(rect.height) || Number(svg.getAttribute("height")) || 400);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, width, height);
    await downloadLabeledImage(canvas.toDataURL("image/png"), filename, labels);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Draw metadata outside the plot so both export paths retain readable labels. */
async function downloadLabeledImage(src: string, filename: string, labels: string[]) {
  const img = await loadImage(src);
  const scale = 2;
  const padding = 24;
  const width = Math.max(600, img.width / scale + padding * 2);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const lines: { text: string; title: boolean }[] = [];
  labels.forEach((label, index) => {
    ctx.font = index === 0 ? "bold 20px Arial" : "14px Arial";
    let line = "";
    for (const word of label.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > width - padding * 2) {
        lines.push({ text: line, title: index === 0 });
        line = word;
      } else line = candidate;
    }
    if (line) lines.push({ text: line, title: index === 0 });
  });
  const headerHeight = padding + lines.reduce((h, line) => h + (line.title ? 30 : 22), 0) + 12;
  canvas.width = width * scale;
  canvas.height = (headerHeight + img.height / scale + padding) * scale;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, canvas.height / scale);
  ctx.textBaseline = "top";
  let y = padding;
  for (const line of lines) {
    ctx.font = line.title ? "bold 20px Arial" : "14px Arial";
    ctx.fillStyle = line.title ? "#0f2f38" : "#425e68";
    ctx.fillText(line.text, padding, y);
    y += line.title ? 30 : 22;
  }
  ctx.drawImage(img, padding, headerHeight, img.width / scale, img.height / scale);
  triggerDownload(canvas.toDataURL("image/png"), filename);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to rasterize chart SVG"));
    img.src = src;
  });
}
