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
const historyList = document.getElementById("historyList");

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

// パラメータ名のマッピング（長い名前 → 短縮名）
const paramMapping = {
    fontSize: 'fs',
    fontColor: 'fc',
    borderColor: 'bc',
    borderWidth: 'bw',
    textPosition: 'tp',
    textShadow: 'ts',
    textBackground: 'tb',
    textPadding: 'pd',
    textBackgroundOpacity: 'bo',
    textStrokeWidth: 'sw',
    fitMode: 'fm',
    imageOffsetX: 'ox',
    imageOffsetY: 'oy'
};

// 逆マッピング（短縮名 → 長い名前）
const reverseParamMapping = Object.fromEntries(
    Object.entries(paramMapping).map(([key, value]) => [value, key])
);

// デフォルト値
const defaultValues = {
    fontSize: '60',
    fontColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: '0',
    textPosition: 'center',
    textShadow: true,
    textBackground: false,
    textPadding: '20',
    textBackgroundOpacity: '80',
    textStrokeWidth: '0',
    fitMode: 'contain',
    imageOffsetX: 0,
    imageOffsetY: 0
};

// 色を短縮する関数（例: #ffffff → fff）
function compressColor(color) {
    if (color.length === 7 && color[1] === color[2] && color[3] === color[4] && color[5] === color[6]) {
        return color[1] + color[3] + color[5];
    }
    return color.substring(1); // # を除去
}

// 色を展開する関数（例: fff → #ffffff）
function expandColor(color) {
    if (!color.startsWith('#')) {
        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        color = '#' + color;
    }
    return color;
}

// URLパラメータに設定を保存
function saveSettingsToURL() {
    const params = new URLSearchParams();
    
    // 各設定を短縮形で保存（デフォルト値の場合は省略）
    if (fontSize.value !== defaultValues.fontSize) {
        params.set(paramMapping.fontSize, fontSize.value);
    }
    
    if (fontColor.value !== defaultValues.fontColor) {
        params.set(paramMapping.fontColor, compressColor(fontColor.value));
    }
    
    if (borderColor.value !== defaultValues.borderColor) {
        params.set(paramMapping.borderColor, compressColor(borderColor.value));
    }
    
    if (borderWidth.value !== defaultValues.borderWidth) {
        params.set(paramMapping.borderWidth, borderWidth.value);
    }
    
    if (textPosition.value !== defaultValues.textPosition) {
        params.set(paramMapping.textPosition, textPosition.value === 'top' ? 't' : 
                                              textPosition.value === 'center' ? 'c' : 'b');
    }
    
    if (textShadow.checked !== defaultValues.textShadow) {
        params.set(paramMapping.textShadow, textShadow.checked ? '1' : '0');
    }
    
    if (textBackground.checked !== defaultValues.textBackground) {
        params.set(paramMapping.textBackground, textBackground.checked ? '1' : '0');
    }
    
    if (textPadding.value !== defaultValues.textPadding) {
        params.set(paramMapping.textPadding, textPadding.value);
    }
    
    if (textBackgroundOpacity.value !== defaultValues.textBackgroundOpacity) {
        params.set(paramMapping.textBackgroundOpacity, textBackgroundOpacity.value);
    }
    
    if (textStrokeWidth.value !== defaultValues.textStrokeWidth) {
        params.set(paramMapping.textStrokeWidth, textStrokeWidth.value);
    }
    
    if (fitMode !== defaultValues.fitMode) {
        params.set(paramMapping.fitMode, fitMode === 'contain' ? 'c' : 'v');
    }
    
    if (imageOffsetX !== defaultValues.imageOffsetX) {
        params.set(paramMapping.imageOffsetX, imageOffsetX);
    }
    
    if (imageOffsetY !== defaultValues.imageOffsetY) {
        params.set(paramMapping.imageOffsetY, imageOffsetY);
    }

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? "?" + queryString : "");
    window.history.replaceState({}, "", newUrl);
}

// URLパラメータから設定を読み込み
function loadSettingsFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // パラメータを確認する関数（短縮形と旧形式の両方をチェック）
    const getParam = (longName) => {
        const shortName = paramMapping[longName];
        if (params.has(shortName)) {
            return params.get(shortName);
        } else if (params.has(longName)) {
            return params.get(longName);
        }
        return null;
    };

    // fontSize
    const fontSizeParam = getParam('fontSize');
    if (fontSizeParam !== null) {
        fontSize.value = fontSizeParam;
        fontSizeValue.textContent = fontSizeParam;
    }

    // fontColor
    const fontColorParam = getParam('fontColor');
    if (fontColorParam !== null) {
        const color = expandColor(fontColorParam);
        fontColor.value = color;
        fontColorHex.value = color;
    }

    // borderColor
    const borderColorParam = getParam('borderColor');
    if (borderColorParam !== null) {
        const color = expandColor(borderColorParam);
        borderColor.value = color;
        borderColorHex.value = color;
    }

    // borderWidth
    const borderWidthParam = getParam('borderWidth');
    if (borderWidthParam !== null) {
        borderWidth.value = borderWidthParam;
        borderWidthValue.textContent = borderWidthParam;
    }

    // textPosition
    const textPositionValue = getParam('textPosition');
    if (textPositionValue !== null) {
        // 短縮形の場合は展開
        if (textPositionValue === 't') {
            textPosition.value = 'top';
        } else if (textPositionValue === 'c') {
            textPosition.value = 'center';
        } else if (textPositionValue === 'b') {
            textPosition.value = 'bottom';
        } else {
            textPosition.value = textPositionValue;
        }
    }

    // textShadow
    const textShadowValue = getParam('textShadow');
    if (textShadowValue !== null) {
        textShadow.checked = textShadowValue === '1' || textShadowValue === 'true';
    }

    // textBackground
    const textBackgroundValue = getParam('textBackground');
    if (textBackgroundValue !== null) {
        textBackground.checked = textBackgroundValue === '1' || textBackgroundValue === 'true';
    }

    // textPadding
    const textPaddingParam = getParam('textPadding');
    if (textPaddingParam !== null) {
        textPadding.value = textPaddingParam;
        textPaddingValue.textContent = textPaddingParam;
    }

    // textBackgroundOpacity
    const textBackgroundOpacityParam = getParam('textBackgroundOpacity');
    if (textBackgroundOpacityParam !== null) {
        textBackgroundOpacity.value = textBackgroundOpacityParam;
        textBackgroundOpacityValue.textContent = textBackgroundOpacityParam;
    }

    // textStrokeWidth
    const textStrokeWidthParam = getParam('textStrokeWidth');
    if (textStrokeWidthParam !== null) {
        textStrokeWidth.value = textStrokeWidthParam;
        textStrokeWidthValue.textContent = textStrokeWidthParam;
    }

    // fitMode
    const fitModeValue = getParam('fitMode');
    if (fitModeValue !== null) {
        // 短縮形の場合は展開
        if (fitModeValue === 'c') {
            fitMode = 'contain';
        } else if (fitModeValue === 'v') {
            fitMode = 'cover';
        } else {
            fitMode = fitModeValue;
        }
    }

    // imageOffsetX
    const imageOffsetXValue = getParam('imageOffsetX');
    if (imageOffsetXValue !== null) {
        imageOffsetX = parseFloat(imageOffsetXValue);
    }

    // imageOffsetY
    const imageOffsetYValue = getParam('imageOffsetY');
    if (imageOffsetYValue !== null) {
        imageOffsetY = parseFloat(imageOffsetYValue);
    }
}

// ページ読み込み時に初期化
window.addEventListener("load", () => {
    initCanvas();
    loadSettingsFromURL();
    drawCanvas();
    displayHistory();
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
                if (parseInt(textStrokeWidth.value) > 0) {
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

// 設定履歴を保存する関数
function saveToHistory() {
    const settings = {
        titleText: titleText.value,
        fontSize: fontSize.value,
        fontColor: fontColor.value,
        borderColor: borderColor.value,
        borderWidth: borderWidth.value,
        textPosition: textPosition.value,
        textShadow: textShadow.checked,
        textBackground: textBackground.checked,
        textPadding: textPadding.value,
        textBackgroundOpacity: textBackgroundOpacity.value,
        textStrokeWidth: textStrokeWidth.value,
        timestamp: Date.now()
    };

    // localStorage から履歴を取得
    let history = JSON.parse(localStorage.getItem('titleImageHistory') || '[]');
    
    // 重複を避けるため、同じ設定が既にあるかチェック
    const isDuplicate = history.some(item => 
        item.titleText === settings.titleText &&
        item.fontSize === settings.fontSize &&
        item.fontColor === settings.fontColor
    );

    if (!isDuplicate) {
        // 新しい設定を履歴の先頭に追加
        history.unshift(settings);
        
        // 履歴は最大20件まで保持
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        // localStorage に保存
        localStorage.setItem('titleImageHistory', JSON.stringify(history));
        
        // 履歴表示を更新
        displayHistory();
    }
}

// 履歴を表示する関数
function displayHistory() {
    const history = JSON.parse(localStorage.getItem('titleImageHistory') || '[]');
    historyList.innerHTML = '';

    history.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.dataset.index = index;

        const text = document.createElement('div');
        text.className = 'history-item-text';
        text.textContent = item.titleText || '(テキストなし)';
        
        // 保存された設定をテキストに適用
        text.style.color = item.fontColor;
        text.style.fontSize = '14px'; // 履歴表示用の固定サイズ
        text.style.fontWeight = 'bold';
        
        // 文字に影をつける
        if (item.textShadow) {
            text.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        }
        
        // 文字に背景をつける
        if (item.textBackground) {
            const opacity = item.textBackgroundOpacity / 100;
            text.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
            text.style.padding = '5px 8px';
            text.style.borderRadius = '4px';
            text.style.marginBottom = '8px';
        }
        
        // 文字に枠線をつける
        if (item.textStrokeWidth > 0) {
            text.style.webkitTextStroke = `${Math.min(item.textStrokeWidth / 4, 1)}px ${item.borderColor}`;
        }

        const details = document.createElement('div');
        details.className = 'history-item-details';
        details.textContent = `${item.fontSize}px`;

        const date = document.createElement('div');
        date.className = 'history-item-date';
        const dateObj = new Date(item.timestamp);
        date.textContent = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'history-delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteHistoryItem(index);
        };

        historyItem.appendChild(text);
        historyItem.appendChild(details);
        historyItem.appendChild(date);
        historyItem.appendChild(deleteBtn);

        historyItem.onclick = () => loadHistoryItem(item);

        historyList.appendChild(historyItem);
    });
}

// 履歴項目を読み込む関数
function loadHistoryItem(item) {
    // テキスト自体は反映させない
    // titleText.value = item.titleText;
    
    // 装飾設定のみ反映
    fontSize.value = item.fontSize;
    fontSizeValue.textContent = item.fontSize;
    fontColor.value = item.fontColor;
    fontColorHex.value = item.fontColor;
    borderColor.value = item.borderColor;
    borderColorHex.value = item.borderColor;
    borderWidth.value = item.borderWidth;
    borderWidthValue.textContent = item.borderWidth;
    textPosition.value = item.textPosition;
    textShadow.checked = item.textShadow;
    textBackground.checked = item.textBackground;
    textPadding.value = item.textPadding;
    textPaddingValue.textContent = item.textPadding;
    textBackgroundOpacity.value = item.textBackgroundOpacity;
    textBackgroundOpacityValue.textContent = item.textBackgroundOpacity;
    textStrokeWidth.value = item.textStrokeWidth;
    textStrokeWidthValue.textContent = item.textStrokeWidth;

    drawCanvas();
    saveSettingsToURL();
}

// 履歴項目を削除する関数
function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem('titleImageHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('titleImageHistory', JSON.stringify(history));
    displayHistory();
}

// ダウンロード処理
downloadBtn.addEventListener("click", () => {
    // テキストがある場合またはアップロードされた画像がある場合のみ実行
    const hasText = titleText.value.trim() !== "";
    if (!uploadedImage && !hasText) return;

    // 履歴に保存
    saveToHistory();

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

    // 履歴に保存
    saveToHistory();

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
