const imageUpload = document.getElementById("imageUpload");
const titleText = document.getElementById("titleText");
const fontSize = document.getElementById("fontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const fontColor = document.getElementById("fontColor");
const fontColorHex = document.getElementById("fontColorHex");
const borderColor = document.getElementById("borderColor");
const borderColorHex = document.getElementById("borderColorHex");
const borderWidth = document.getElementById("borderWidth");
const borderWidthValue = document.getElementById("borderWidthValue");
const textPosition = document.getElementById("textPosition");
const textShadow = document.getElementById("textShadow");
const textBackground = document.getElementById("textBackground");
const textPadding = document.getElementById("textPadding");
const textPaddingValue = document.getElementById("textPaddingValue");
const textBackgroundOpacity = document.getElementById("textBackgroundOpacity");
const textBackgroundOpacityValue = document.getElementById("textBackgroundOpacityValue");
const textStroke = document.getElementById("textStroke");
const textStrokeWidth = document.getElementById("textStrokeWidth");
const textStrokeWidthValue = document.getElementById("textStrokeWidthValue");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const copyImageBtn = document.getElementById("copyImageBtn");
const copyUrlBtn = document.getElementById("copyUrlBtn");
const clearBtn = document.getElementById("clearBtn");
const noImageMessage = document.getElementById("noImageMessage");
const eyedropperBtn = document.getElementById("eyedropperBtn");
const borderEyedropperBtn = document.getElementById("borderEyedropperBtn");

let uploadedImage = null;
let fitMode = "contain"; // 'contain' または 'cover'
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;
let isEyedropperMode = false;
let isBorderEyedropperMode = false;
let originalFontColor = "#ffffff";
let originalBorderColor = "#000000";

// フォントサイズスライダーの値を表示
fontSize.addEventListener("input", (e) => {
    fontSizeValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 枠の太さスライダーの値を表示
borderWidth.addEventListener("input", (e) => {
    borderWidthValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 文字背景の余白スライダーの値を表示
textPadding.addEventListener("input", (e) => {
    textPaddingValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 文字背景の透明度スライダーの値を表示
textBackgroundOpacity.addEventListener("input", (e) => {
    textBackgroundOpacityValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 文字枠線チェックボックスの処理
textStroke.addEventListener("change", (e) => {
    drawCanvas();
    saveSettingsToURL();
});

// 文字枠線の太さスライダーの値を表示
textStrokeWidth.addEventListener("input", (e) => {
    textStrokeWidthValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 補色を計算する関数
function getComplementaryColor(hex) {
    // HEXをRGBに変換
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // 補色を計算
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;

    // RGBをHEXに変換
    const toHex = (n) => n.toString(16).padStart(2, "0");
    return `#${toHex(compR)}${toHex(compG)}${toHex(compB)}`;
}

// HEX入力値の検証
function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

// 文字色が変更されたら枠色を自動更新
fontColor.addEventListener("input", (e) => {
    const color = e.target.value;
    fontColorHex.value = color;
    const complementary = getComplementaryColor(color);
    borderColor.value = complementary;
    borderColorHex.value = complementary;
    drawCanvas();
    saveSettingsToURL();
});

// 文字色HEX入力の処理
fontColorHex.addEventListener("input", (e) => {
    let value = e.target.value;
    if (!value.startsWith("#")) {
        value = "#" + value;
    }
    e.target.value = value;

    if (isValidHex(value)) {
        fontColor.value = value;
        const complementary = getComplementaryColor(value);
        borderColor.value = complementary;
        borderColorHex.value = complementary;
        drawCanvas();
        saveSettingsToURL();
    }
});

// 枠色が変更された時の処理
borderColor.addEventListener("input", (e) => {
    borderColorHex.value = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 枠色HEX入力の処理
borderColorHex.addEventListener("input", (e) => {
    let value = e.target.value;
    if (!value.startsWith("#")) {
        value = "#" + value;
    }
    e.target.value = value;

    if (isValidHex(value)) {
        borderColor.value = value;
        drawCanvas();
        saveSettingsToURL();
    }
});

// その他のコントロールのイベントリスナー
titleText.addEventListener("input", drawCanvas);
textPosition.addEventListener("change", () => {
    drawCanvas();
    saveSettingsToURL();
});
textShadow.addEventListener("change", () => {
    drawCanvas();
    saveSettingsToURL();
});
textBackground.addEventListener("change", () => {
    drawCanvas();
    saveSettingsToURL();
});

// 画像を読み込む共通関数
function loadImage(src) {
    const img = new Image();
    img.onload = () => {
        uploadedImage = img;
        noImageMessage.style.display = "none";
        downloadBtn.disabled = false;
        copyImageBtn.disabled = false;
        fitMode = "contain";
        imageOffsetX = 0;
        imageOffsetY = 0;
        drawCanvas();
    };
    img.src = src;
}

// 画像アップロード処理
imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            loadImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// クリップボードからの貼り付け処理
document.addEventListener("paste", (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (e) => {
                loadImage(e.target.result);
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            break;
        }
    }
});

// 初期化時にキャンバスサイズを設定
function initCanvas() {
    canvas.width = 1280;
    canvas.height = 670;
}

// URLパラメータに設定を保存
function saveSettingsToURL() {
    const params = new URLSearchParams();
    params.set("fontSize", fontSize.value);
    params.set("fontColor", fontColor.value);
    params.set("borderColor", borderColor.value);
    params.set("borderWidth", borderWidth.value);
    params.set("textPosition", textPosition.value);
    params.set("textShadow", textShadow.checked);
    params.set("textBackground", textBackground.checked);
    params.set("textPadding", textPadding.value);
    params.set("textBackgroundOpacity", textBackgroundOpacity.value);
    params.set("textStroke", textStroke.checked);
    params.set("textStrokeWidth", textStrokeWidth.value);
    params.set("fitMode", fitMode);
    params.set("imageOffsetX", imageOffsetX);
    params.set("imageOffsetY", imageOffsetY);

    const newUrl = window.location.pathname + "?" + params.toString();
    window.history.replaceState({}, "", newUrl);
}

// URLパラメータから設定を読み込み
function loadSettingsFromURL() {
    const params = new URLSearchParams(window.location.search);

    if (params.has("fontSize")) {
        fontSize.value = params.get("fontSize");
        fontSizeValue.textContent = params.get("fontSize");
    }

    if (params.has("fontColor")) {
        const color = params.get("fontColor");
        fontColor.value = color;
        fontColorHex.value = color;
    }

    if (params.has("borderColor")) {
        const color = params.get("borderColor");
        borderColor.value = color;
        borderColorHex.value = color;
    }

    if (params.has("borderWidth")) {
        borderWidth.value = params.get("borderWidth");
        borderWidthValue.textContent = params.get("borderWidth");
    }

    if (params.has("textPosition")) {
        textPosition.value = params.get("textPosition");
    }

    if (params.has("textShadow")) {
        textShadow.checked = params.get("textShadow") === "true";
    }

    if (params.has("textBackground")) {
        textBackground.checked = params.get("textBackground") === "true";
    }

    if (params.has("textPadding")) {
        textPadding.value = params.get("textPadding");
        textPaddingValue.textContent = params.get("textPadding");
    }

    if (params.has("textBackgroundOpacity")) {
        textBackgroundOpacity.value = params.get("textBackgroundOpacity");
        textBackgroundOpacityValue.textContent = params.get("textBackgroundOpacity");
    }

    if (params.has("textStroke")) {
        textStroke.checked = params.get("textStroke") === "true";
    }

    if (params.has("textStrokeWidth")) {
        textStrokeWidth.value = params.get("textStrokeWidth");
        textStrokeWidthValue.textContent = params.get("textStrokeWidth");
    }

    if (params.has("fitMode")) {
        fitMode = params.get("fitMode");
    }

    if (params.has("imageOffsetX")) {
        imageOffsetX = parseFloat(params.get("imageOffsetX"));
    }

    if (params.has("imageOffsetY")) {
        imageOffsetY = parseFloat(params.get("imageOffsetY"));
    }
}

// ページ読み込み時に初期化
window.addEventListener("load", () => {
    initCanvas();
    loadSettingsFromURL();
    drawCanvas();
});

// キャンバスに描画
function drawCanvas() {
    // キャンバスサイズは固定
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // タイトルテキストの内容をチェック
    const hasText = titleText.value.trim() !== "";
    
    // 画像がない場合の処理
    if (!uploadedImage) {
        if (hasText) {
            // テキストがある場合は透過背景で画像を作成
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            // noImageMessageを隠す
            noImageMessage.style.display = "none";
            // ダウンロード・コピーボタンを有効化
            downloadBtn.disabled = false;
            copyImageBtn.disabled = false;
        } else {
            // テキストがない場合は従来通り灰色背景で終了
            ctx.fillStyle = "#f0f0f0";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            // noImageMessageを表示
            noImageMessage.style.display = "block";
            // ダウンロード・コピーボタンを無効化
            downloadBtn.disabled = true;
            copyImageBtn.disabled = true;
            return;
        }
    } else {
        // 画像がある場合は従来通り灰色背景で開始
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        // noImageMessageを隠す
        noImageMessage.style.display = "none";
        // ダウンロード・コピーボタンを有効化
        downloadBtn.disabled = false;
        copyImageBtn.disabled = false;
    }

    // 画像がある場合のみ画像描画処理を実行
    if (uploadedImage) {
        // フィットモードに応じてスケールを計算
        let scale, scaledWidth, scaledHeight, x, y;

        if (fitMode === "contain") {
            // 全体が表示されるようにフィット（高さフィット）
            scale = Math.min(
                canvasWidth / uploadedImage.width,
                canvasHeight / uploadedImage.height
            );
        } else {
            // 画面を埋めるようにフィット（幅フィット）
            scale = Math.max(
                canvasWidth / uploadedImage.width,
                canvasHeight / uploadedImage.height
            );
        }

        scaledWidth = uploadedImage.width * scale;
        scaledHeight = uploadedImage.height * scale;
        x = (canvasWidth - scaledWidth) / 2 + imageOffsetX;
        y = (canvasHeight - scaledHeight) / 2 + imageOffsetY;

    // クリッピング領域を設定
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.clip();

    // 画像を描画
    ctx.drawImage(uploadedImage, x, y, scaledWidth, scaledHeight);
        ctx.restore();

        // 枠を描画
        const borderWidthVal = parseInt(borderWidth.value);
        if (borderWidthVal > 0) {
            ctx.strokeStyle = borderColor.value;
            ctx.lineWidth = borderWidthVal;
            ctx.strokeRect(
                borderWidthVal / 2,
                borderWidthVal / 2,
                canvas.width - borderWidthVal,
                canvas.height - borderWidthVal
            );
        }
    }

    // テキストがある場合のみ描画
    const text = titleText.value.trim();
    if (text) {
        // フォント設定
        const fontSizeVal = fontSize.value;
        ctx.font = `bold ${fontSizeVal}px 'Noto Sans JP', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // テキスト位置を計算
        let textX = canvas.width / 2;
        let textY;

        switch (textPosition.value) {
            case "top":
                textY = canvas.height * 0.2;
                break;
            case "bottom":
                textY = canvas.height * 0.8;
                break;
            default: // center
                textY = canvas.height / 2;
        }

        // 影を描画
        if (textShadow.checked) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
        }

        // テキストを描画
        ctx.fillStyle = fontColor.value;

        // 改行で分割
        const lines = text.split("\n");
        const lineHeight = parseInt(fontSizeVal) * 1.2;

        // 各行を幅に収まるように分割
        const wrappedLines = [];
        const maxWidth = canvas.width * 0.9;

        lines.forEach((line) => {
            if (line.trim() === "") {
                wrappedLines.push("");
            } else {
                const subLines = getLines(ctx, line, maxWidth);
                wrappedLines.push(...subLines);
            }
        });

        // 複数行の場合は中央揃えになるよう調整
        const totalHeight = wrappedLines.length * lineHeight;
        const startY = textY - totalHeight / 2 + lineHeight / 2;

        // 文字背景を描画
        if (textBackground.checked) {
            const padding = parseInt(textPadding.value);
            ctx.save();

            // 各行の幅を計測して最大幅を取得
            let maxTextWidth = 0;
            wrappedLines.forEach((line) => {
                if (line.trim() !== "") {
                    const textWidth = ctx.measureText(line).width;
                    maxTextWidth = Math.max(maxTextWidth, textWidth);
                }
            });

            // 背景の描画位置とサイズを計算
            const bgX = textX - maxTextWidth / 2 - padding;
            const bgY = startY - lineHeight / 2 - padding;
            const bgWidth = maxTextWidth + padding * 2;
            const bgHeight = totalHeight + padding * 2;
            const borderRadius = 10;

            // 角丸四角形を描画
            ctx.fillStyle = borderColor.value;
            ctx.globalAlpha = textBackgroundOpacity.value / 100; // 透明度を適用
            ctx.beginPath();
            ctx.moveTo(bgX + borderRadius, bgY);
            ctx.lineTo(bgX + bgWidth - borderRadius, bgY);
            ctx.arcTo(
                bgX + bgWidth,
                bgY,
                bgX + bgWidth,
                bgY + borderRadius,
                borderRadius
            );
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - borderRadius);
            ctx.arcTo(
                bgX + bgWidth,
                bgY + bgHeight,
                bgX + bgWidth - borderRadius,
                bgY + bgHeight,
                borderRadius
            );
            ctx.lineTo(bgX + borderRadius, bgY + bgHeight);
            ctx.arcTo(
                bgX,
                bgY + bgHeight,
                bgX,
                bgY + bgHeight - borderRadius,
                borderRadius
            );
            ctx.lineTo(bgX, bgY + borderRadius);
            ctx.arcTo(bgX, bgY, bgX + borderRadius, bgY, borderRadius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // テキストを描画
        ctx.fillStyle = fontColor.value;
        wrappedLines.forEach((line, index) => {
            if (line.trim() !== "") {
                // 枠線を描画（fillTextより先に描画）
                if (textStroke.checked) {
                    ctx.strokeStyle = borderColor.value;
                    ctx.lineWidth = parseInt(textStrokeWidth.value);
                    ctx.strokeText(line, textX, startY + index * lineHeight);
                }
                // 文字を描画
                ctx.fillText(line, textX, startY + index * lineHeight);
            }
        });

        // 影をリセット
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// テキストを改行して配列で返す
function getLines(ctx, text, maxWidth) {
    // 日本語文字をチェック
    const containsJapanese = (str) => {
        return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str);
    };

    // スペースがない、または日本語を含む場合は文字単位で改行
    if (!text.includes(" ") || containsJapanese(text)) {
        const lines = [];
        let currentLine = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const width = ctx.measureText(testLine).width;

            if (width < maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = char;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    } else {
        // 英語など、スペースで区切られた言語は単語単位で改行
        const words = text.split(" ");
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}

// ダウンロード処理
downloadBtn.addEventListener("click", () => {
    // テキストがある場合またはアップロードされた画像がある場合のみ実行
    const hasText = titleText.value.trim() !== "";
    if (!uploadedImage && !hasText) return;

    const link = document.createElement("a");
    link.download = "note-title.png";
    link.href = canvas.toDataURL();
    link.click();
});

// 画像コピー処理
copyImageBtn.addEventListener("click", async () => {
    // テキストがある場合またはアップロードされた画像がある場合のみ実行
    const hasText = titleText.value.trim() !== "";
    if (!uploadedImage && !hasText) return;

    try {
        // キャンバスをBlobに変換
        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ]);

                // ボタンのテキストと色を一時的に変更
                const originalText = copyImageBtn.textContent;
                copyImageBtn.textContent = "コピーしました！";
                copyImageBtn.classList.add("copied");

                setTimeout(() => {
                    copyImageBtn.textContent = originalText;
                    copyImageBtn.classList.remove("copied");
                }, 2000);
            } catch (err) {
                // フォールバック: ダウンロードリンクを表示
                const link = document.createElement("a");
                link.download = "note-title.png";
                link.href = canvas.toDataURL();
                link.click();

                const originalText = copyImageBtn.textContent;
                copyImageBtn.textContent = "ダウンロードしました";

                setTimeout(() => {
                    copyImageBtn.textContent = originalText;
                }, 2000);
            }
        }, "image/png");
    } catch (err) {
        // さらなるフォールバック
        const link = document.createElement("a");
        link.download = "note-title.png";
        link.href = canvas.toDataURL();
        link.click();

        const originalText = copyImageBtn.textContent;
        copyImageBtn.textContent = "ダウンロードしました";

        setTimeout(() => {
            copyImageBtn.textContent = originalText;
        }, 2000);
    }
});

// URLコピー処理
copyUrlBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);

        // ボタンのテキストと色を一時的に変更
        const originalText = copyUrlBtn.textContent;
        copyUrlBtn.textContent = "コピーしました！";
        copyUrlBtn.classList.add("copied");

        setTimeout(() => {
            copyUrlBtn.textContent = originalText;
            copyUrlBtn.classList.remove("copied");
        }, 2000);
    } catch (err) {
        // フォールバック: テキストエリアを使用
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        const originalText = copyUrlBtn.textContent;
        copyUrlBtn.textContent = "コピーしました！";
        copyUrlBtn.classList.add("copied");

        setTimeout(() => {
            copyUrlBtn.textContent = originalText;
            copyUrlBtn.classList.remove("copied");
        }, 2000);
    }
});

// クリア処理
clearBtn.addEventListener("click", () => {
    // 確認ダイアログを表示
    if (confirm("画像とテキストをクリアしますか？")) {
        // 画像をクリア
        uploadedImage = null;
        imageUpload.value = "";
        
        // テキストをクリア
        titleText.value = "";
        
        // 画像オフセットをリセット
        imageOffsetX = 0;
        imageOffsetY = 0;
        fitMode = "contain";
        
        // キャンバスを再描画
        drawCanvas();
        
        // URLを更新
        saveSettingsToURL();
    }
});

// キャンバスクリックでフィットモード切り替えまたはスポイト機能
canvas.addEventListener("click", (e) => {
    if (!uploadedImage || hasDragged) return;

    // 文字色スポイトモードの場合は色を取得
    if (isEyedropperMode) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // キャンバスから色を取得
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        
        // RGBをHEXに変換
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        // 色を設定
        fontColor.value = hex;
        fontColorHex.value = hex;
        const complementary = getComplementaryColor(hex);
        borderColor.value = complementary;
        borderColorHex.value = complementary;
        
        // スポイトモードを終了（色は確定）
        isEyedropperMode = false;
        eyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");
        
        // 新しい色を元の色として更新
        originalFontColor = hex;
        originalBorderColor = complementary;
        
        drawCanvas();
        saveSettingsToURL();
        return;
    }
    
    // 枠色スポイトモードの場合は色を取得
    if (isBorderEyedropperMode) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // キャンバスから色を取得
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        
        // RGBをHEXに変換
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        // 色を設定
        borderColor.value = hex;
        borderColorHex.value = hex;
        
        // スポイトモードを終了（色は確定）
        isBorderEyedropperMode = false;
        borderEyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");
        
        // 新しい色を元の色として更新
        originalBorderColor = hex;
        
        drawCanvas();
        saveSettingsToURL();
        return;
    }

    // 通常のフィットモード切り替え
    fitMode = fitMode === "contain" ? "cover" : "contain";
    imageOffsetX = 0;
    imageOffsetY = 0;
    drawCanvas();
    saveSettingsToURL();
});

// ドラッグ開始
canvas.addEventListener("mousedown", (e) => {
    if (!uploadedImage || fitMode === "contain" || isEyedropperMode || isBorderEyedropperMode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX * scaleX - imageOffsetX;
    dragStartY = e.clientY * scaleY - imageOffsetY;
    canvas.style.cursor = "grabbing";
});

// ドラッグ中またはスポイトプレビュー
canvas.addEventListener("mousemove", (e) => {
    // 文字色スポイトモードでのプレビュー
    if (isEyedropperMode && !isDragging && uploadedImage) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // キャンバスから色を取得
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        
        // RGBをHEXに変換
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        // プレビュー表示
        fontColor.value = hex;
        fontColorHex.value = hex;
        const complementary = getComplementaryColor(hex);
        borderColor.value = complementary;
        borderColorHex.value = complementary;
        
        drawCanvas();
        return;
    }
    
    // 枠色スポイトモードでのプレビュー
    if (isBorderEyedropperMode && !isDragging && uploadedImage) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // キャンバスから色を取得
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];
        
        // RGBをHEXに変換
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        // プレビュー表示
        borderColor.value = hex;
        borderColorHex.value = hex;
        
        drawCanvas();
        return;
    }
    
    if (!isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const newOffsetX = e.clientX * scaleX - dragStartX;
    const newOffsetY = e.clientY * scaleY - dragStartY;

    // 実際に移動があった場合のみドラッグとみなす
    if (
        Math.abs(newOffsetX - imageOffsetX) > 2 ||
        Math.abs(newOffsetY - imageOffsetY) > 2
    ) {
        hasDragged = true;
    }

    imageOffsetX = newOffsetX;
    imageOffsetY = newOffsetY;

    // 画像が画面外に出ないように制限
    const canvasWidth = 1280;
    const canvasHeight = 670;
    const scale = Math.max(
        canvasWidth / uploadedImage.width,
        canvasHeight / uploadedImage.height
    );
    const scaledWidth = uploadedImage.width * scale;
    const scaledHeight = uploadedImage.height * scale;

    const maxOffsetX = Math.max(0, (scaledWidth - canvasWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - canvasHeight) / 2);

    imageOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, imageOffsetX));
    imageOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, imageOffsetY));

    drawCanvas();
    saveSettingsToURL();
});

// ドラッグ終了
canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = fitMode === "cover" ? "grab" : "pointer";

    // ドラッグフラグをリセット（少し遅延させる）
    setTimeout(() => {
        hasDragged = false;
    }, 100);
});

// マウスカーソルの変更
canvas.addEventListener("mouseenter", () => {
    if (!uploadedImage) return;
    if (isEyedropperMode || isBorderEyedropperMode) {
        canvas.style.cursor = "crosshair";
    } else {
        canvas.style.cursor = fitMode === "cover" ? "grab" : "pointer";
    }
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "default";
});

// 文字色スポイトツール機能
eyedropperBtn.addEventListener("click", () => {
    if (!uploadedImage) return;
    
    // 他のスポイトモードを終了
    if (isBorderEyedropperMode) {
        isBorderEyedropperMode = false;
        borderEyedropperBtn.classList.remove("active");
        // 枠色を元に戻す
        borderColor.value = originalBorderColor;
        borderColorHex.value = originalBorderColor;
    }
    
    isEyedropperMode = !isEyedropperMode;
    
    if (isEyedropperMode) {
        // 元の色を保存
        originalFontColor = fontColor.value;
        originalBorderColor = borderColor.value;
        
        eyedropperBtn.classList.add("active");
        canvas.classList.add("canvas-eyedropper");
        canvas.style.cursor = "crosshair";
    } else {
        // 元の色に戻す
        fontColor.value = originalFontColor;
        fontColorHex.value = originalFontColor;
        borderColor.value = originalBorderColor;
        borderColorHex.value = originalBorderColor;
        
        eyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");
        canvas.style.cursor = fitMode === "cover" ? "grab" : "pointer";
        
        drawCanvas();
        saveSettingsToURL();
    }
});

// 枠色スポイトツール機能
borderEyedropperBtn.addEventListener("click", () => {
    if (!uploadedImage) return;
    
    // 他のスポイトモードを終了
    if (isEyedropperMode) {
        isEyedropperMode = false;
        eyedropperBtn.classList.remove("active");
        // 文字色を元に戻す
        fontColor.value = originalFontColor;
        fontColorHex.value = originalFontColor;
        // 枠色も元の補色に戻す
        const complementary = getComplementaryColor(originalFontColor);
        borderColor.value = complementary;
        borderColorHex.value = complementary;
    }
    
    isBorderEyedropperMode = !isBorderEyedropperMode;
    
    if (isBorderEyedropperMode) {
        // 元の色を保存
        originalBorderColor = borderColor.value;
        
        borderEyedropperBtn.classList.add("active");
        canvas.classList.add("canvas-eyedropper");
        canvas.style.cursor = "crosshair";
    } else {
        // 元の色に戻す
        borderColor.value = originalBorderColor;
        borderColorHex.value = originalBorderColor;
        
        borderEyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");
        canvas.style.cursor = fitMode === "cover" ? "grab" : "pointer";
        
        drawCanvas();
        saveSettingsToURL();
    }
});
