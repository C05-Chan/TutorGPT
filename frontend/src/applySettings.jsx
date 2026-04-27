export function applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle) {
    const root = document.body;
    
    // ── Dark / Light mode ────────────────────────────────────────────
    if (displayMode === "Dark") {
        root.style.setProperty("--bg-color", "#111111");
        root.style.setProperty("--text-color", "#ffffff");
    } else {
        root.style.setProperty("--bg-color", "#ffffff");
        root.style.setProperty("--text-color", "#111111");
    }
    
    // ── Text size ────────────────────────────────────────────────────
    const sizeMap = {
        Small: "13px",
        Medium: "16px",
        Large: "20px",
    };
    root.style.setProperty("--font-size", sizeMap[displayTextSize] || "16px");
    
    // ── Font family ──────────────────────────────────────────────────
    const fontMap = {
        Arial: "Arial, sans-serif",
        "Times New Roman": "'Times New Roman', Times, serif",
        "Courier New": "'Courier New', Courier, monospace",
    };
    root.style.setProperty("--font-family", fontMap[displayFontStyle] || "Arial, sans-serif");
}
