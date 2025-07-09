# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **noteタイトル画像メーカー** (Note Title Image Maker) - a web-based image editing application for creating blog/note title graphics. It's a pure vanilla JavaScript application with no build system or dependencies.

**Demo**: https://motohasystem.github.io/note-title-crafter/

## Development Commands

**No build system** - This is a static web application:
- **Local development**: Open `index.html` in a browser or serve with any static server
- **No npm scripts** - No package.json exists
- **No linting/testing** - Pure vanilla JS without tooling
- **Deployment**: Static files can be deployed directly to any web server

## Architecture Overview

### Core Application Structure
- **Single-page application** built with vanilla HTML5/CSS3/JavaScript
- **Canvas-based** image manipulation using HTML5 Canvas API
- **Event-driven** architecture with DOM event listeners for user interactions
- **State management** through global variables and URL parameters

### Key Files
- `index.html` - Main application HTML structure
- `script.js` - All JavaScript functionality (697 lines, single file)
- `style.css` - Complete styling and responsive design

### Main JavaScript Architecture (script.js)

**State Variables:**
- `uploadedImage` - Current background image
- `fitMode` - Image display mode ("contain" or "cover")  
- `imageOffsetX/Y` - Image positioning for drag functionality
- `isDragging`, `dragStartX/Y`, `hasDragged` - Drag state management

**Core Functions:**
- `drawCanvas()` - Main rendering function, redraws entire canvas
- `loadImageFromFile()` - Handles image upload and processing
- `saveSettingsToURL()` - Persists settings to URL parameters
- `loadSettingsFromURL()` - Restores settings from URL parameters
- Event listeners for all UI controls

**Canvas Rendering Pipeline:**
1. Clear canvas (1280×670px fixed size)
2. Draw background image with current fit mode and offset
3. Apply border if enabled
4. Draw text with all styling (shadow, background, positioning)

### Image Processing Features
- **Dual fit modes**: Height-fit (contain) and width-fit (cover)
- **Interactive positioning**: Click to toggle modes, drag to reposition in cover mode
- **Fixed output size**: Always 1280×670px (optimized for note platform)

### Text Rendering System
- **Multi-line support** with automatic line height calculation
- **Positioning system**: Top/center/bottom alignment
- **Styling features**: Color, size (20-150px), shadow, rounded background
- **Color complementing**: Border color auto-set to text color complement

### Settings Persistence
- **URL-based**: All settings (except title text) saved to URL parameters
- **Sharing mechanism**: Generated URLs can be shared to restore exact settings
- **Parameter mapping**: Each UI control maps to specific URL parameter

## Code Patterns

### Event Handling Pattern
```javascript
// Standard pattern for UI controls
control.addEventListener("input", (e) => {
    // Update display value if needed
    drawCanvas();           // Re-render canvas
    saveSettingsToURL();    // Persist to URL
});
```

### Canvas Drawing Pattern
```javascript
// All drawing happens in drawCanvas() function
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (uploadedImage) {
        // Draw background image with current mode/offset
        // Apply border if enabled
    }
    // Draw text with all styling
}
```

### Color Management
- Use `hexToRgb()` and `rgbToHex()` for color conversions
- Complement colors calculated with `getComplementaryColor()`
- Both color picker and hex input supported for all colors

## Feature Implementation Notes

### Image Upload Methods
- File input dialog
- Drag & drop onto canvas
- Clipboard paste (Ctrl+V / Cmd+V)
- All methods use `loadImageFromFile()` function

### Canvas Interaction
- **Click**: Toggle between contain/cover modes (unless drag occurred)
- **Drag**: Move image position in cover mode
- **Mouse events**: Track drag state to prevent mode switching after drag

### Export Options
- **Download**: Canvas.toBlob() → download link
- **Clipboard**: Canvas.toBlob() → Clipboard API
- **URL sharing**: Generate shareable URL with current settings

## Browser Compatibility
- **Modern browsers** required for Clipboard API
- **Canvas API** support needed
- **File API** for drag & drop functionality
- No polyfills or fallbacks implemented

## Responsive Design
- **CSS Grid/Flexbox** layout
- **Mobile-friendly** touch interactions
- **Adaptive sizing** for different screen sizes
- Canvas maintains fixed aspect ratio

## Development History

This application was built incrementally through a series of feature additions documented in the original CLAUDE.md prompts section. Key evolution points:
1. Basic upload + text overlay
2. Multi-line text support  
3. Image fit modes and dragging
4. Text styling (color, shadow, background)
5. Settings persistence via URL
6. Clipboard integration
7. UI polish and responsive design

The codebase maintains this incremental structure, with all functionality consolidated into the single script.js file.

---

<small>Version 1.1 | Last updated: 2025-07-09</small>