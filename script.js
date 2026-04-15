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
const textPositionValue = document.getElementById("textPositionValue");
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
const aspectRatio = document.getElementById("aspectRatio");
const customSizeGroup = document.querySelector(".custom-size-group");
const customWidth = document.getElementById("customWidth");
const customHeight = document.getElementById("customHeight");
const layerListEl = document.getElementById("layerList");
const addLayerBtn = document.getElementById("addLayerBtn");

let uploadedImage = null;
let fitMode = "contain"; // 'contain' または 'cover'
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;
let isTextDragging = false;
let textDragStartY = 0;
let textDragStartPosition = 0;
let draggedLayerIndex = 0;
let isEyedropperMode = false;
let isBorderEyedropperMode = false;
let originalFontColor = "#ffffff";
let originalBorderColor = "#000000";

// テキストレイヤーのデータモデル
let textLayers = [
    {
        id: 0,
        text: '',
        fontSize: 60,
        fontColor: '#ffffff',
        borderColor: '#000000',
        textPosition: 50,
        textShadow: true,
        textStrokeWidth: 0,
        bounds: null
    }
];
let activeLayerIndex = 0;
let nextLayerId = 1;

// レイヤーデフォルト値
function createDefaultLayer() {
    return {
        id: nextLayerId++,
        text: '',
        fontSize: 60,
        fontColor: '#ffffff',
        borderColor: '#000000',
        textPosition: 50,
        textShadow: true,
        textStrokeWidth: 0,
        bounds: null
    };
}

// アクティブレイヤーのデータからUIコントロールに反映
function syncControlsToLayer(index) {
    const layer = textLayers[index];
    if (!layer) return;
    titleText.value = layer.text;
    fontSize.value = layer.fontSize;
    fontSizeValue.textContent = layer.fontSize;
    fontColor.value = layer.fontColor;
    fontColorHex.value = layer.fontColor;
    borderColor.value = layer.borderColor;
    borderColorHex.value = layer.borderColor;
    textPosition.value = layer.textPosition;
    textPositionValue.textContent = layer.textPosition;
    textShadow.checked = layer.textShadow;
    textStrokeWidth.value = layer.textStrokeWidth;
    textStrokeWidthValue.textContent = layer.textStrokeWidth;
}

// UIコントロールの値をアクティブレイヤーのデータに反映
function syncLayerFromControls(index) {
    const layer = textLayers[index];
    if (!layer) return;
    layer.text = titleText.value;
    layer.fontSize = parseInt(fontSize.value);
    layer.fontColor = fontColor.value;
    layer.borderColor = borderColor.value;
    layer.textPosition = parseInt(textPosition.value);
    layer.textShadow = textShadow.checked;
    layer.textStrokeWidth = parseInt(textStrokeWidth.value);
}

// レイヤーリストのUI描画
function renderLayerList() {
    layerListEl.innerHTML = '';
    textLayers.forEach((layer, index) => {
        const item = document.createElement('div');
        item.className = 'layer-item' + (index === activeLayerIndex ? ' active' : '');

        const label = document.createElement('span');
        label.className = 'layer-label';
        const preview = layer.text.split('\n')[0] || `テキスト ${index + 1}`;
        label.textContent = preview.substring(0, 20) || `テキスト ${index + 1}`;
        label.style.color = layer.fontColor;
        label.style.textShadow = '0 0 2px rgba(0,0,0,0.5)';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'layer-delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = '削除';
        deleteBtn.disabled = textLayers.length <= 1;
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            removeLayer(index);
        };

        item.onclick = () => selectLayer(index);
        item.appendChild(label);
        item.appendChild(deleteBtn);
        layerListEl.appendChild(item);
    });
}

// レイヤーを選択
function selectLayer(index) {
    // 現在の値を保存してから切り替え
    syncLayerFromControls(activeLayerIndex);
    activeLayerIndex = index;
    syncControlsToLayer(index);
    renderLayerList();
}

// レイヤーを追加（直前のレイヤーのスタイルをコピー）
function addLayer() {
    const newLayer = createDefaultLayer();
    // 最後のレイヤーからスタイルをコピー
    const lastLayer = textLayers[textLayers.length - 1];
    if (lastLayer) {
        newLayer.fontSize = lastLayer.fontSize;
        newLayer.fontColor = lastLayer.fontColor;
        newLayer.borderColor = lastLayer.borderColor;
        newLayer.textShadow = lastLayer.textShadow;
        newLayer.textStrokeWidth = lastLayer.textStrokeWidth;
    }
    textLayers.push(newLayer);
    selectLayer(textLayers.length - 1);
    drawCanvas();
    saveSettingsToURL();
}

// レイヤーを削除
function removeLayer(index) {
    if (textLayers.length <= 1) return;
    textLayers.splice(index, 1);
    if (activeLayerIndex >= textLayers.length) {
        activeLayerIndex = textLayers.length - 1;
    } else if (activeLayerIndex > index) {
        activeLayerIndex--;
    }
    syncControlsToLayer(activeLayerIndex);
    renderLayerList();
    drawCanvas();
    saveSettingsToURL();
}

// レイヤー追加ボタン
addLayerBtn.addEventListener("click", addLayer);

// フォントサイズスライダーの値を表示
fontSize.addEventListener("input", (e) => {
    fontSizeValue.textContent = e.target.value;
    syncLayerFromControls(activeLayerIndex);
    renderLayerList();
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

// スモーク（背景を暗く）スライダーの値を表示
textBackgroundOpacity.addEventListener("input", (e) => {
    textBackgroundOpacityValue.textContent = e.target.value;
    drawCanvas();
    saveSettingsToURL();
});

// 文字枠線の太さスライダーの値を表示
textStrokeWidth.addEventListener("input", (e) => {
    textStrokeWidthValue.textContent = e.target.value;
    syncLayerFromControls(activeLayerIndex);
    renderLayerList();
    drawCanvas();
    saveSettingsToURL();
});

// 縦横比選択の変更イベント
aspectRatio.addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === 'custom') {
        customSizeGroup.style.display = 'block';
    } else {
        customSizeGroup.style.display = 'none';
    }
    initCanvas(); // キャンバスサイズを更新
    saveSettingsToURL();
});

// カスタムサイズの変更イベント
customWidth.addEventListener("input", () => {
    if (aspectRatio.value === 'custom') {
        initCanvas();
        saveSettingsToURL();
    }
});

customHeight.addEventListener("input", () => {
    if (aspectRatio.value === 'custom') {
        initCanvas();
        saveSettingsToURL();
    }
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
    syncLayerFromControls(activeLayerIndex);
    renderLayerList();
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
        syncLayerFromControls(activeLayerIndex);
        renderLayerList();
        drawCanvas();
        saveSettingsToURL();
    }
});

// 枠色が変更された時の処理
borderColor.addEventListener("input", (e) => {
    borderColorHex.value = e.target.value;
    syncLayerFromControls(activeLayerIndex);
    renderLayerList();
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
        syncLayerFromControls(activeLayerIndex);
        renderLayerList();
        drawCanvas();
        saveSettingsToURL();
    }
});

// その他のコントロールのイベントリスナー
titleText.addEventListener("input", () => {
    syncLayerFromControls(activeLayerIndex);
    renderLayerList();
    drawCanvas();
});
textPosition.addEventListener("input", (e) => {
    textPositionValue.textContent = e.target.value;
    syncLayerFromControls(activeLayerIndex);
    drawCanvas();
    saveSettingsToURL();
});
textShadow.addEventListener("change", () => {
    syncLayerFromControls(activeLayerIndex);
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

// 縦横比のプリセット定義
const aspectRatioPresets = {
    'note': { width: 1280, height: 670 },
    'ogp': { width: 1200, height: 630 },
    '16:9': { width: 1280, height: 720 },
    '1:1': { width: 1080, height: 1080 },
    '4:3': { width: 1280, height: 960 }
};

// キャンバスサイズを更新する関数
function updateCanvasSize(width, height) {
    canvas.width = width;
    canvas.height = height;

    // CSSのアスペクト比も更新
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.style.aspectRatio = `${width} / ${height}`;

    // 再描画
    drawCanvas();
}

// 初期化時にキャンバスサイズを設定
function initCanvas() {
    const selectedRatio = aspectRatio.value;
    if (selectedRatio === 'custom') {
        updateCanvasSize(parseInt(customWidth.value), parseInt(customHeight.value));
    } else {
        const preset = aspectRatioPresets[selectedRatio];
        updateCanvasSize(preset.width, preset.height);
    }
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
    imageOffsetY: 'oy',
    aspectRatio: 'ar',
    customWidth: 'cw',
    customHeight: 'ch',
    textLayers: 'tl'
};

// 逆マッピング（短縮名 → 長い名前）
const reverseParamMapping = Object.fromEntries(
    Object.entries(paramMapping).map(([key, value]) => [value, key])
);

// デフォルト値（グローバル設定用）
const defaultValues = {
    borderWidth: '0',
    textBackgroundOpacity: '0',
    fitMode: 'contain',
    imageOffsetX: 0,
    imageOffsetY: 0,
    aspectRatio: 'note',
    customWidth: '1280',
    customHeight: '720'
};

// レイヤーのデフォルト値
const layerDefaults = {
    fontSize: 60,
    fontColor: '#ffffff',
    borderColor: '#000000',
    textPosition: 50,
    textShadow: true,
    textStrokeWidth: 0
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

    // グローバル設定
    if (borderWidth.value !== defaultValues.borderWidth) {
        params.set(paramMapping.borderWidth, borderWidth.value);
    }

    if (textBackgroundOpacity.value !== defaultValues.textBackgroundOpacity) {
        params.set(paramMapping.textBackgroundOpacity, textBackgroundOpacity.value);
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

    if (aspectRatio.value !== defaultValues.aspectRatio) {
        params.set(paramMapping.aspectRatio, aspectRatio.value);
    }

    if (aspectRatio.value === 'custom') {
        if (customWidth.value !== defaultValues.customWidth) {
            params.set(paramMapping.customWidth, customWidth.value);
        }
        if (customHeight.value !== defaultValues.customHeight) {
            params.set(paramMapping.customHeight, customHeight.value);
        }
    }

    // テキストレイヤーをシリアライズ
    const layersData = textLayers.map(layer => {
        const obj = {};
        if (layer.text) obj.t = layer.text;
        if (layer.fontSize !== layerDefaults.fontSize) obj.fs = layer.fontSize;
        if (layer.fontColor !== layerDefaults.fontColor) obj.fc = compressColor(layer.fontColor);
        if (layer.borderColor !== layerDefaults.borderColor) obj.bc = compressColor(layer.borderColor);
        if (layer.textPosition !== layerDefaults.textPosition) obj.tp = layer.textPosition;
        if (layer.textShadow !== layerDefaults.textShadow) obj.ts = layer.textShadow ? 1 : 0;
        if (layer.textStrokeWidth !== layerDefaults.textStrokeWidth) obj.sw = layer.textStrokeWidth;
        return obj;
    });

    // 意味のあるデータがある場合のみ保存
    const hasData = layersData.length > 1 || layersData.some(obj => Object.keys(obj).length > 0);
    if (hasData) {
        params.set(paramMapping.textLayers, JSON.stringify(layersData));
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

    // グローバル設定の読み込み
    // borderWidth
    const borderWidthParam = getParam('borderWidth');
    if (borderWidthParam !== null) {
        borderWidth.value = borderWidthParam;
        borderWidthValue.textContent = borderWidthParam;
    }

    // textBackgroundOpacity (スモーク)
    const textBackgroundOpacityParam = getParam('textBackgroundOpacity');
    if (textBackgroundOpacityParam !== null) {
        textBackgroundOpacity.value = textBackgroundOpacityParam;
        textBackgroundOpacityValue.textContent = textBackgroundOpacityParam;
    }

    // fitMode
    const fitModeValue = getParam('fitMode');
    if (fitModeValue !== null) {
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

    // aspectRatio
    const aspectRatioValue = getParam('aspectRatio');
    if (aspectRatioValue !== null) {
        aspectRatio.value = aspectRatioValue;
        if (aspectRatioValue === 'custom') {
            customSizeGroup.style.display = 'block';
        }
    }

    // customWidth
    const customWidthValue = getParam('customWidth');
    if (customWidthValue !== null) {
        customWidth.value = customWidthValue;
    }

    // customHeight
    const customHeightValue = getParam('customHeight');
    if (customHeightValue !== null) {
        customHeight.value = customHeightValue;
    }

    // テキストレイヤーの読み込み
    const layersParam = getParam('textLayers');
    if (layersParam) {
        // 新形式: JSON配列
        try {
            const layersData = JSON.parse(layersParam);
            textLayers = layersData.map((data, i) => ({
                id: i,
                text: data.t || '',
                fontSize: data.fs !== undefined ? data.fs : layerDefaults.fontSize,
                fontColor: data.fc ? expandColor(data.fc) : layerDefaults.fontColor,
                borderColor: data.bc ? expandColor(data.bc) : layerDefaults.borderColor,
                textPosition: data.tp !== undefined ? data.tp : layerDefaults.textPosition,
                textShadow: data.ts !== undefined ? !!data.ts : layerDefaults.textShadow,
                textStrokeWidth: data.sw !== undefined ? data.sw : layerDefaults.textStrokeWidth,
                bounds: null
            }));
            nextLayerId = textLayers.length;
            activeLayerIndex = 0;
        } catch (e) {
            // パース失敗時はデフォルト
        }
    } else {
        // 旧形式: 個別パラメータから単一レイヤーとして読み込み
        const layer = textLayers[0];

        const fontSizeParam = getParam('fontSize');
        if (fontSizeParam !== null) layer.fontSize = parseInt(fontSizeParam);

        const fontColorParam = getParam('fontColor');
        if (fontColorParam !== null) layer.fontColor = expandColor(fontColorParam);

        const borderColorParam = getParam('borderColor');
        if (borderColorParam !== null) layer.borderColor = expandColor(borderColorParam);

        const textPositionParam = getParam('textPosition');
        if (textPositionParam !== null) {
            if (textPositionParam === 't' || textPositionParam === 'top') {
                layer.textPosition = 20;
            } else if (textPositionParam === 'c' || textPositionParam === 'center') {
                layer.textPosition = 50;
            } else if (textPositionParam === 'b' || textPositionParam === 'bottom') {
                layer.textPosition = 80;
            } else {
                layer.textPosition = parseInt(textPositionParam);
            }
        }

        const textShadowParam = getParam('textShadow');
        if (textShadowParam !== null) {
            layer.textShadow = textShadowParam === '1' || textShadowParam === 'true';
        }

        const textStrokeWidthParam = getParam('textStrokeWidth');
        if (textStrokeWidthParam !== null) layer.textStrokeWidth = parseInt(textStrokeWidthParam);
    }

    // UIに反映
    syncControlsToLayer(activeLayerIndex);
    renderLayerList();
}

// ページ読み込み時に初期化
window.addEventListener("load", () => {
    loadSettingsFromURL(); // 先にURLから設定を読み込む
    initCanvas(); // その後キャンバスを初期化
    drawCanvas();
    displayHistory();
});

// キャンバスに描画
function drawCanvas() {
    // キャンバスサイズは固定
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // テキストレイヤーにテキストがあるかチェック
    const hasText = textLayers.some(l => l.text.trim() !== '');

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

    // スモークオーバーレイ（背景画像全体を暗くする）
    const smokeOpacity = parseInt(textBackgroundOpacity.value) / 100;
    if (smokeOpacity > 0 && uploadedImage) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${smokeOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // すべてのテキストレイヤーを描画
    textLayers.forEach((layer) => {
        layer.bounds = drawTextLayer(layer);
    });
}

// テキストレイヤーを1つ描画し、boundsを返す
function drawTextLayer(layer) {
    const text = layer.text.trim();
    if (!text) return null;

    const fontSizeVal = layer.fontSize;
    ctx.font = `bold ${fontSizeVal}px 'Noto Sans JP', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let textX = canvas.width / 2;
    let textY = canvas.height * (layer.textPosition / 100);

    // 影を描画
    if (layer.textShadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }

    ctx.fillStyle = layer.fontColor;

    // 改行で分割
    const lines = text.split("\n");
    const lineHeight = fontSizeVal * 1.2;

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

    // 各行の幅を計測して最大幅を取得（ヒットテスト用）
    let maxTextWidth = 0;
    wrappedLines.forEach((line) => {
        if (line.trim() !== "") {
            const tw = ctx.measureText(line).width;
            maxTextWidth = Math.max(maxTextWidth, tw);
        }
    });
    const hitPadding = 30;
    const bounds = {
        x: textX - maxTextWidth / 2 - hitPadding,
        y: startY - lineHeight / 2 - hitPadding,
        width: maxTextWidth + hitPadding * 2,
        height: totalHeight + hitPadding * 2
    };

    // テキストを描画
    ctx.fillStyle = layer.fontColor;
    wrappedLines.forEach((line, index) => {
        if (line.trim() !== "") {
            // 枠線を描画（fillTextより先に描画）
            if (layer.textStrokeWidth > 0) {
                ctx.strokeStyle = layer.borderColor;
                ctx.lineWidth = layer.textStrokeWidth;
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

    return bounds;
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
        textLayers: textLayers.map(l => ({
            text: l.text,
            fontSize: l.fontSize,
            fontColor: l.fontColor,
            borderColor: l.borderColor,
            textPosition: l.textPosition,
            textShadow: l.textShadow,
            textStrokeWidth: l.textStrokeWidth
        })),
        borderWidth: borderWidth.value,
        textBackgroundOpacity: textBackgroundOpacity.value,
        aspectRatio: aspectRatio.value,
        customWidth: customWidth.value,
        customHeight: customHeight.value,
        timestamp: Date.now()
    };

    // localStorage から履歴を取得
    let history = JSON.parse(localStorage.getItem('titleImageHistory') || '[]');

    // 重複を避けるため、同じ設定が既にあるかチェック
    const firstLayerText = textLayers[0] ? textLayers[0].text : '';
    const firstLayerSize = textLayers[0] ? textLayers[0].fontSize : 60;
    const isDuplicate = history.some(item => {
        if (item.textLayers) {
            return item.textLayers[0] && item.textLayers[0].text === firstLayerText &&
                   item.textLayers[0].fontSize === firstLayerSize;
        }
        // 旧形式との比較
        return item.titleText === firstLayerText && item.fontSize === String(firstLayerSize);
    });

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

        // 旧形式・新形式の両方に対応
        let displayText, displayColor, displaySize, hasShadow, hasStroke, strokeColor;
        if (item.textLayers && item.textLayers.length > 0) {
            const first = item.textLayers[0];
            displayText = first.text || '(テキストなし)';
            displayColor = first.fontColor;
            displaySize = first.fontSize;
            hasShadow = first.textShadow;
            hasStroke = first.textStrokeWidth > 0;
            strokeColor = first.borderColor;
        } else {
            displayText = item.titleText || '(テキストなし)';
            displayColor = item.fontColor;
            displaySize = item.fontSize;
            hasShadow = item.textShadow;
            hasStroke = item.textStrokeWidth > 0;
            strokeColor = item.borderColor;
        }

        const text = document.createElement('div');
        text.className = 'history-item-text';
        text.textContent = displayText;
        text.style.color = displayColor;
        text.style.fontSize = '14px';
        text.style.fontWeight = 'bold';

        if (hasShadow) {
            text.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        }

        if (hasStroke) {
            text.style.webkitTextStroke = `${Math.min(parseInt(hasStroke) / 4, 1)}px ${strokeColor}`;
        }

        const details = document.createElement('div');
        details.className = 'history-item-details';
        details.textContent = `${displaySize}px`;
        if (item.textLayers && item.textLayers.length > 1) {
            details.textContent += ` / ${item.textLayers.length}レイヤー`;
        }

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
    if (item.textLayers && item.textLayers.length > 0) {
        // 新形式
        textLayers = item.textLayers.map((l, i) => ({
            id: i,
            text: l.text || '',
            fontSize: l.fontSize || 60,
            fontColor: l.fontColor || '#ffffff',
            borderColor: l.borderColor || '#000000',
            textPosition: l.textPosition !== undefined ? l.textPosition : 50,
            textShadow: l.textShadow !== undefined ? l.textShadow : true,
            textStrokeWidth: l.textStrokeWidth || 0,
            bounds: null
        }));
        nextLayerId = textLayers.length;
        activeLayerIndex = 0;
    } else {
        // 旧形式: 単一レイヤーとして読み込み
        const pos = item.textPosition === 'top' ? 20 :
                     item.textPosition === 'center' ? 50 :
                     item.textPosition === 'bottom' ? 80 :
                     parseInt(item.textPosition) || 50;
        textLayers = [{
            id: 0,
            text: '', // テキスト自体は反映させない（旧動作と同じ）
            fontSize: parseInt(item.fontSize) || 60,
            fontColor: item.fontColor || '#ffffff',
            borderColor: item.borderColor || '#000000',
            textPosition: pos,
            textShadow: item.textShadow !== undefined ? item.textShadow : true,
            textStrokeWidth: parseInt(item.textStrokeWidth) || 0,
            bounds: null
        }];
        nextLayerId = 1;
        activeLayerIndex = 0;
    }

    // グローバル設定
    borderWidth.value = item.borderWidth || '0';
    borderWidthValue.textContent = borderWidth.value;
    textBackgroundOpacity.value = item.textBackgroundOpacity || '0';
    textBackgroundOpacityValue.textContent = textBackgroundOpacity.value;

    if (item.aspectRatio) {
        aspectRatio.value = item.aspectRatio;
        if (item.aspectRatio === 'custom') {
            customSizeGroup.style.display = 'block';
            if (item.customWidth) customWidth.value = item.customWidth;
            if (item.customHeight) customHeight.value = item.customHeight;
        } else {
            customSizeGroup.style.display = 'none';
        }
    }

    syncControlsToLayer(activeLayerIndex);
    renderLayerList();
    initCanvas();
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
    const hasText = textLayers.some(l => l.text.trim() !== '');
    if (!uploadedImage && !hasText) return;

    // 履歴に保存
    saveToHistory();

    // 現在の日付を取得してファイル名を生成
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filename = `Morimaru-${year}${month}${day}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
});

// 画像コピー処理
copyImageBtn.addEventListener("click", async () => {
    const hasText = textLayers.some(l => l.text.trim() !== '');
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
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const filename = `Morimaru-${year}${month}${day}.png`;

                const link = document.createElement("a");
                link.download = filename;
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
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const filename = `Morimaru-${year}${month}${day}.png`;

        const link = document.createElement("a");
        link.download = filename;
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

        // テキストレイヤーをリセット
        textLayers = [createDefaultLayer()];
        activeLayerIndex = 0;
        syncControlsToLayer(0);
        renderLayerList();

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

        // アクティブレイヤーに反映
        syncLayerFromControls(activeLayerIndex);

        // スポイトモードを終了（色は確定）
        isEyedropperMode = false;
        eyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");

        // 新しい色を元の色として更新
        originalFontColor = hex;
        originalBorderColor = complementary;

        renderLayerList();
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

        // アクティブレイヤーに反映
        syncLayerFromControls(activeLayerIndex);

        // スポイトモードを終了（色は確定）
        isBorderEyedropperMode = false;
        borderEyedropperBtn.classList.remove("active");
        canvas.classList.remove("canvas-eyedropper");

        // 新しい色を元の色として更新
        originalBorderColor = hex;

        renderLayerList();
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
    if (isEyedropperMode || isBorderEyedropperMode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // テキストレイヤーのヒットテスト（上のレイヤーから逆順にチェック）
    for (let i = textLayers.length - 1; i >= 0; i--) {
        const layer = textLayers[i];
        if (layer.bounds &&
            canvasX >= layer.bounds.x && canvasX <= layer.bounds.x + layer.bounds.width &&
            canvasY >= layer.bounds.y && canvasY <= layer.bounds.y + layer.bounds.height) {

            isTextDragging = true;
            draggedLayerIndex = i;
            textDragStartY = e.clientY;
            textDragStartPosition = layer.textPosition;
            hasDragged = false;
            canvas.style.cursor = "ns-resize";

            // クリックしたレイヤーを選択
            if (activeLayerIndex !== i) {
                syncLayerFromControls(activeLayerIndex);
                activeLayerIndex = i;
                syncControlsToLayer(i);
                renderLayerList();
            }

            e.preventDefault();
            return;
        }
    }

    // 画像ドラッグ（coverモード時のみ）
    if (!uploadedImage || fitMode === "contain") return;

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

    // テキスト位置ドラッグ中
    if (isTextDragging) {
        const layer = textLayers[draggedLayerIndex];
        const deltaY = e.clientY - textDragStartY;
        const rect = canvas.getBoundingClientRect();
        const deltaPercent = (deltaY / rect.height) * 100;
        let newPosition = Math.round(textDragStartPosition + deltaPercent);
        newPosition = Math.max(10, Math.min(90, newPosition));

        if (Math.abs(deltaY) > 2) {
            hasDragged = true;
        }

        layer.textPosition = newPosition;
        // アクティブレイヤーならUIも更新
        if (draggedLayerIndex === activeLayerIndex) {
            textPosition.value = newPosition;
            textPositionValue.textContent = newPosition;
        }
        drawCanvas();
        saveSettingsToURL();
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
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
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
    isTextDragging = false;

    if (isEyedropperMode || isBorderEyedropperMode) {
        canvas.style.cursor = "crosshair";
    } else {
        canvas.style.cursor = fitMode === "cover" ? "grab" : "pointer";
    }

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
    isTextDragging = false;
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
