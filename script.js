const imageUpload = document.getElementById('imageUpload');
const titleText = document.getElementById('titleText');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontColor = document.getElementById('fontColor');
const borderColor = document.getElementById('borderColor');
const borderWidth = document.getElementById('borderWidth');
const borderWidthValue = document.getElementById('borderWidthValue');
const textPosition = document.getElementById('textPosition');
const textShadow = document.getElementById('textShadow');
const textBackground = document.getElementById('textBackground');
const textPadding = document.getElementById('textPadding');
const textPaddingValue = document.getElementById('textPaddingValue');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const noImageMessage = document.getElementById('noImageMessage');

let uploadedImage = null;
let fitMode = 'contain'; // 'contain' または 'cover'
let imageOffsetX = 0;
let imageOffsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let hasDragged = false;

// フォントサイズスライダーの値を表示
fontSize.addEventListener('input', (e) => {
    fontSizeValue.textContent = e.target.value;
    drawCanvas();
});

// 枠の太さスライダーの値を表示
borderWidth.addEventListener('input', (e) => {
    borderWidthValue.textContent = e.target.value;
    drawCanvas();
});

// 文字背景の余白スライダーの値を表示
textPadding.addEventListener('input', (e) => {
    textPaddingValue.textContent = e.target.value;
    drawCanvas();
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
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return `#${toHex(compR)}${toHex(compG)}${toHex(compB)}`;
}

// 文字色が変更されたら枠色を自動更新
fontColor.addEventListener('input', (e) => {
    borderColor.value = getComplementaryColor(e.target.value);
    drawCanvas();
});

// その他のコントロールのイベントリスナー
titleText.addEventListener('input', drawCanvas);
borderColor.addEventListener('input', drawCanvas);
textPosition.addEventListener('change', drawCanvas);
textShadow.addEventListener('change', drawCanvas);
textBackground.addEventListener('change', drawCanvas);

// 画像アップロード処理
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                canvas.style.display = 'block';
                noImageMessage.style.display = 'none';
                downloadBtn.disabled = false;
                fitMode = 'contain';
                imageOffsetX = 0;
                imageOffsetY = 0;
                drawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// キャンバスに描画
function drawCanvas() {
    if (!uploadedImage) return;

    // キャンバスサイズを固定
    const canvasWidth = 1280;
    const canvasHeight = 670;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 背景を塗りつぶし
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // フィットモードに応じてスケールを計算
    let scale, scaledWidth, scaledHeight, x, y;
    
    if (fitMode === 'contain') {
        // 全体が表示されるようにフィット（高さフィット）
        scale = Math.min(canvasWidth / uploadedImage.width, canvasHeight / uploadedImage.height);
    } else {
        // 画面を埋めるようにフィット（幅フィット）
        scale = Math.max(canvasWidth / uploadedImage.width, canvasHeight / uploadedImage.height);
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
        ctx.strokeRect(borderWidthVal / 2, borderWidthVal / 2, canvas.width - borderWidthVal, canvas.height - borderWidthVal);
    }

    // テキストがある場合のみ描画
    const text = titleText.value.trim();
    if (text) {
        // フォント設定
        const fontSizeVal = fontSize.value;
        ctx.font = `bold ${fontSizeVal}px 'Noto Sans JP', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // テキスト位置を計算
        let textX = canvas.width / 2;
        let textY;
        
        switch (textPosition.value) {
            case 'top':
                textY = canvas.height * 0.2;
                break;
            case 'bottom':
                textY = canvas.height * 0.8;
                break;
            default: // center
                textY = canvas.height / 2;
        }

        // 影を描画
        if (textShadow.checked) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
        }

        // テキストを描画
        ctx.fillStyle = fontColor.value;
        
        // 改行で分割
        const lines = text.split('\n');
        const lineHeight = parseInt(fontSizeVal) * 1.2;
        
        // 各行を幅に収まるように分割
        const wrappedLines = [];
        const maxWidth = canvas.width * 0.9;
        
        lines.forEach(line => {
            if (line.trim() === '') {
                wrappedLines.push('');
            } else {
                const subLines = getLines(ctx, line, maxWidth);
                wrappedLines.push(...subLines);
            }
        });
        
        // 複数行の場合は中央揃えになるよう調整
        const totalHeight = wrappedLines.length * lineHeight;
        const startY = textY - (totalHeight / 2) + (lineHeight / 2);
        
        // 文字背景を描画
        if (textBackground.checked) {
            const padding = parseInt(textPadding.value);
            ctx.save();
            
            // 各行の幅を計測して最大幅を取得
            let maxTextWidth = 0;
            wrappedLines.forEach(line => {
                if (line.trim() !== '') {
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
            ctx.globalAlpha = 0.8; // 少し透明にする
            ctx.beginPath();
            ctx.moveTo(bgX + borderRadius, bgY);
            ctx.lineTo(bgX + bgWidth - borderRadius, bgY);
            ctx.arcTo(bgX + bgWidth, bgY, bgX + bgWidth, bgY + borderRadius, borderRadius);
            ctx.lineTo(bgX + bgWidth, bgY + bgHeight - borderRadius);
            ctx.arcTo(bgX + bgWidth, bgY + bgHeight, bgX + bgWidth - borderRadius, bgY + bgHeight, borderRadius);
            ctx.lineTo(bgX + borderRadius, bgY + bgHeight);
            ctx.arcTo(bgX, bgY + bgHeight, bgX, bgY + bgHeight - borderRadius, borderRadius);
            ctx.lineTo(bgX, bgY + borderRadius);
            ctx.arcTo(bgX, bgY, bgX + borderRadius, bgY, borderRadius);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        // テキストを描画
        ctx.fillStyle = fontColor.value;
        wrappedLines.forEach((line, index) => {
            if (line.trim() !== '') {
                ctx.fillText(line, textX, startY + (index * lineHeight));
            }
        });
        
        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// テキストを改行して配列で返す
function getLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// ダウンロード処理
downloadBtn.addEventListener('click', () => {
    if (!uploadedImage) return;
    
    const link = document.createElement('a');
    link.download = 'blog-title.png';
    link.href = canvas.toDataURL();
    link.click();
});

// キャンバスクリックでフィットモード切り替え
canvas.addEventListener('click', (e) => {
    if (!uploadedImage || hasDragged) return;
    
    fitMode = fitMode === 'contain' ? 'cover' : 'contain';
    imageOffsetX = 0;
    imageOffsetY = 0;
    drawCanvas();
});

// ドラッグ開始
canvas.addEventListener('mousedown', (e) => {
    if (!uploadedImage || fitMode === 'contain') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX * scaleX - imageOffsetX;
    dragStartY = e.clientY * scaleY - imageOffsetY;
    canvas.style.cursor = 'grabbing';
});

// ドラッグ中
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const newOffsetX = e.clientX * scaleX - dragStartX;
    const newOffsetY = e.clientY * scaleY - dragStartY;
    
    // 実際に移動があった場合のみドラッグとみなす
    if (Math.abs(newOffsetX - imageOffsetX) > 2 || Math.abs(newOffsetY - imageOffsetY) > 2) {
        hasDragged = true;
    }
    
    imageOffsetX = newOffsetX;
    imageOffsetY = newOffsetY;
    
    // 画像が画面外に出ないように制限
    const canvasWidth = 1280;
    const canvasHeight = 670;
    const scale = Math.max(canvasWidth / uploadedImage.width, canvasHeight / uploadedImage.height);
    const scaledWidth = uploadedImage.width * scale;
    const scaledHeight = uploadedImage.height * scale;
    
    const maxOffsetX = Math.max(0, (scaledWidth - canvasWidth) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - canvasHeight) / 2);
    
    imageOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, imageOffsetX));
    imageOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, imageOffsetY));
    
    drawCanvas();
});

// ドラッグ終了
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = fitMode === 'cover' ? 'grab' : 'pointer';
    
    // ドラッグフラグをリセット（少し遅延させる）
    setTimeout(() => {
        hasDragged = false;
    }, 100);
});

// マウスカーソルの変更
canvas.addEventListener('mouseenter', () => {
    if (!uploadedImage) return;
    canvas.style.cursor = fitMode === 'cover' ? 'grab' : 'pointer';
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
});