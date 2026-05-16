export function applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle) {

    // sets defaults in localStorage if not already set so the app always has a value to read
    if (!localStorage.getItem("responseLength")) {
        localStorage.setItem("responseLength", "Medium")
    }
    if (!localStorage.getItem("displayMode")) {
        localStorage.setItem("displayMode", displayMode || "Light")
    }
    
    const root = document.body; // targets the body element to apply CSS variables globally

    // applies dark or light mode colours to the CSS variables
    if (displayMode === "Dark") {
        root.style.setProperty("--bg-color", "#383838");
        root.style.setProperty("--text-color", "#ffffff");
    } else {
        root.style.setProperty("--bg-color", "#ffffff");
        root.style.setProperty("--text-color", "#111111");
    }
    
    // maps setting values to CSS font sizes and applies the matching size
    const sizeMap = {
        Small: "11px",
        Medium: "16px",
        Large: "21px",
    };
    root.style.setProperty("--font-size", sizeMap[displayTextSize] || "16px"); // set the font size to the selected displayTextSize or default to 16px
    
    // maps setting values to CSS font families and applies the matching font
    const fontMap = {
        Arial: "Arial, sans-serif",
        "Times New Roman": "'Times New Roman', Times, serif",
        "Courier New": "'Courier New', Courier, monospace", 
    };
    root.style.setProperty("--font-family", fontMap[displayFontStyle] || "Arial, sans-serif"); // set the font to the selected displayFontStyle or default to Arial
}