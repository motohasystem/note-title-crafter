# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

これは **サムネ盛丸（モリマル）** - ブログ記事やnote用のタイトル画像を作成するWebベースの画像編集アプリケーションです。純粋なバニラJavaScriptアプリケーションで、ビルドシステムや依存関係はありません。

**デモサイト**: https://motohasystem.github.io/note-title-crafter/

## 開発コマンド

**ビルドシステムなし** - これは静的Webアプリケーションです：
- **ローカル開発**: `index.html`をブラウザで開くか、任意の静的サーバーで提供
- **npmスクリプトなし** - package.jsonは存在しません
- **リンティング/テストなし** - ツールなしの純粋なバニラJS
- **デプロイ**: 静的ファイルは任意のWebサーバーに直接デプロイ可能

## アーキテクチャ概要

### コアアプリケーション構造
- バニラHTML5/CSS3/JavaScriptで構築された**シングルページアプリケーション**
- HTML5 Canvas APIを使用した**Canvasベース**の画像操作
- ユーザーインタラクション用のDOMイベントリスナーを持つ**イベント駆動**アーキテクチャ
- グローバル変数とURLパラメータによる**状態管理**

### 主要ファイル
- `index.html` - メインアプリケーションのHTML構造
- `script.js` - すべてのJavaScript機能（697行、単一ファイル）
- `style.css` - 完全なスタイリングとレスポンシブデザイン

### メインJavaScriptアーキテクチャ (script.js)

**状態変数:**
- `uploadedImage` - 現在の背景画像
- `fitMode` - 画像表示モード ("contain" または "cover")
- `imageOffsetX/Y` - ドラッグ機能用の画像位置
- `isDragging`, `dragStartX/Y`, `hasDragged` - ドラッグ状態管理

**コア関数:**
- `drawCanvas()` - メインレンダリング関数、キャンバス全体を再描画
- `loadImageFromFile()` - 画像アップロードと処理を処理
- `saveSettingsToURL()` - 設定をURLパラメータに永続化
- `loadSettingsFromURL()` - URLパラメータから設定を復元
- すべてのUIコントロール用のイベントリスナー

**Canvasレンダリングパイプライン:**
1. キャンバスをクリア（1280×670px固定サイズ）
2. 現在のフィットモードとオフセットで背景画像を描画
3. 有効な場合は枠線を適用
4. すべてのスタイリング（影、背景、位置）でテキストを描画

### 画像処理機能
- **デュアルフィットモード**: 高さフィット（contain）と幅フィット（cover）
- **インタラクティブポジショニング**: クリックでモード切り替え、カバーモードでドラッグして再配置
- **固定出力サイズ**: 常に1280×670px（noteプラットフォーム用に最適化）

### テキストレンダリングシステム
- 自動行高計算による**複数行サポート**
- **位置決めシステム**: 上/中央/下の配置
- **スタイリング機能**: 色、サイズ（20-150px）、影、角丸背景
- **色補完**: 枠線色は文字色の補色に自動設定

### 設定の永続化
- **URLベース**: すべての設定（タイトルテキストを除く）はURLパラメータに保存
- **共有メカニズム**: 生成されたURLは正確な設定を復元するために共有可能
- **パラメータマッピング**: 各UIコントロールは特定のURLパラメータにマップ

## コードパターン

### イベント処理パターン
```javascript
// UIコントロールの標準パターン
control.addEventListener("input", (e) => {
    // 必要に応じて表示値を更新
    drawCanvas();           // キャンバスを再レンダリング
    saveSettingsToURL();    // URLに永続化
});
```

### Canvas描画パターン
```javascript
// すべての描画はdrawCanvas()関数で行われる
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (uploadedImage) {
        // 現在のモード/オフセットで背景画像を描画
        // 有効な場合は枠線を適用
    }
    // すべてのスタイリングでテキストを描画
}
```

### 色管理
- 色変換には`hexToRgb()`と`rgbToHex()`を使用
- 補色は`getComplementaryColor()`で計算
- すべての色にカラーピッカーと16進数入力の両方をサポート

## 機能実装の注意点

### 画像アップロード方法
- ファイル入力ダイアログ
- キャンバスへのドラッグ＆ドロップ
- クリップボード貼り付け（Ctrl+V / Cmd+V）
- すべての方法は`loadImageFromFile()`関数を使用

### Canvasインタラクション
- **クリック**: contain/coverモード間の切り替え（ドラッグが発生していない場合）
- **ドラッグ**: カバーモードで画像位置を移動
- **マウスイベント**: ドラッグ後のモード切り替えを防ぐためにドラッグ状態を追跡

### エクスポートオプション
- **ダウンロード**: Canvas.toBlob() → ダウンロードリンク
- **クリップボード**: Canvas.toBlob() → Clipboard API
- **URL共有**: 現在の設定で共有可能なURLを生成

## ブラウザ互換性
- Clipboard APIのために**モダンブラウザ**が必要
- **Canvas API**サポートが必要
- ドラッグ＆ドロップ機能のための**File API**
- ポリフィルやフォールバックは実装されていません

## レスポンシブデザイン
- **CSS Grid/Flexbox**レイアウト
- **モバイルフレンドリー**なタッチインタラクション
- 異なる画面サイズに対する**適応サイズ設定**
- キャンバスは固定アスペクト比を維持

## 開発履歴

このアプリケーションは、元のCLAUDE.mdプロンプトセクションに文書化された一連の機能追加を通じて段階的に構築されました。主な進化ポイント：
1. 基本的なアップロード + テキストオーバーレイ
2. 複数行テキストサポート
3. 画像フィットモードとドラッグ
4. テキストスタイリング（色、影、背景）
5. URL経由の設定永続化
6. クリップボード統合
7. UIの洗練とレスポンシブデザイン

コードベースはこの段階的な構造を維持し、すべての機能は単一のscript.jsファイルに統合されています。

---

<small>バージョン 1.3 | 最終更新: 2025-07-24</small>