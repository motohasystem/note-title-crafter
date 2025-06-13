using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Win32;
using System.Windows.Interop;
using System.Runtime.InteropServices;

namespace NoteTitleMaker
{
    public partial class MainWindow : Window
    {
        private BitmapImage? uploadedImage;
        private Bitmap? canvasBitmap;
        private bool isDragging = false;
        private System.Windows.Point dragStart;
        private double imageOffsetX = 0;
        private double imageOffsetY = 0;
        private string fitMode = "contain";
        private bool hasDragged = false;
        
        public MainWindow()
        {
            InitializeComponent();
            InitializeCanvas();
            this.AllowDrop = true;
            this.Drop += Window_Drop;
            this.PreviewKeyDown += Window_PreviewKeyDown;
        }
        
        private void InitializeCanvas()
        {
            canvasBitmap = new Bitmap(1280, 670);
            DrawCanvas();
        }
        
        private void Window_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                if (files.Length > 0)
                {
                    LoadImage(files[0]);
                }
            }
        }
        
        private void Window_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.V && Keyboard.Modifiers == ModifierKeys.Control)
            {
                if (Clipboard.ContainsImage())
                {
                    var image = Clipboard.GetImage();
                    if (image != null)
                    {
                        uploadedImage = image as BitmapImage;
                        if (uploadedImage == null)
                        {
                            uploadedImage = ConvertToBitmapImage(image);
                        }
                        OnImageLoaded();
                    }
                }
                e.Handled = true;
            }
        }
        
        private BitmapImage ConvertToBitmapImage(BitmapSource source)
        {
            var encoder = new PngBitmapEncoder();
            encoder.Frames.Add(BitmapFrame.Create(source));
            
            using (var ms = new MemoryStream())
            {
                encoder.Save(ms);
                ms.Position = 0;
                
                var image = new BitmapImage();
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.StreamSource = ms;
                image.EndInit();
                
                return image;
            }
        }
        
        private void UploadButton_Click(object sender, RoutedEventArgs e)
        {
            var openFileDialog = new OpenFileDialog
            {
                Filter = "Image files (*.png;*.jpg;*.jpeg;*.gif;*.bmp)|*.png;*.jpg;*.jpeg;*.gif;*.bmp|All files (*.*)|*.*"
            };
            
            if (openFileDialog.ShowDialog() == true)
            {
                LoadImage(openFileDialog.FileName);
            }
        }
        
        private void LoadImage(string filePath)
        {
            try
            {
                uploadedImage = new BitmapImage(new Uri(filePath));
                OnImageLoaded();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"画像の読み込みに失敗しました: {ex.Message}", "エラー", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private void OnImageLoaded()
        {
            NoImageMessage.Visibility = Visibility.Collapsed;
            DownloadButton.IsEnabled = true;
            CopyImageButton.IsEnabled = true;
            fitMode = "contain";
            imageOffsetX = 0;
            imageOffsetY = 0;
            DrawCanvas();
        }
        
        private void FontColorButton_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new System.Windows.Forms.ColorDialog();
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                var color = dialog.Color;
                var hexColor = $"#{color.R:X2}{color.G:X2}{color.B:X2}";
                FontColorHex.Text = hexColor;
                FontColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(color.R, color.G, color.B));
                
                // Auto-set complementary color
                var compColor = GetComplementaryColor(color);
                var compHex = $"#{compColor.R:X2}{compColor.G:X2}{compColor.B:X2}";
                BorderColorHex.Text = compHex;
                BorderColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(compColor.R, compColor.G, compColor.B));
                
                DrawCanvas();
            }
        }
        
        private void BorderColorButton_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new System.Windows.Forms.ColorDialog();
            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                var color = dialog.Color;
                var hexColor = $"#{color.R:X2}{color.G:X2}{color.B:X2}";
                BorderColorHex.Text = hexColor;
                BorderColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(color.R, color.G, color.B));
                DrawCanvas();
            }
        }
        
        private System.Drawing.Color GetComplementaryColor(System.Drawing.Color color)
        {
            return System.Drawing.Color.FromArgb(255 - color.R, 255 - color.G, 255 - color.B);
        }
        
        private void FontColorHex_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (FontColorButton == null || BorderColorHex == null || BorderColorButton == null) return;
            
            if (IsValidHexColor(FontColorHex.Text))
            {
                var color = ColorTranslator.FromHtml(FontColorHex.Text);
                FontColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(color.R, color.G, color.B));
                
                var compColor = GetComplementaryColor(color);
                var compHex = $"#{compColor.R:X2}{compColor.G:X2}{compColor.B:X2}";
                BorderColorHex.Text = compHex;
                BorderColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(compColor.R, compColor.G, compColor.B));
                
                DrawCanvas();
            }
        }
        
        private void BorderColorHex_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (BorderColorButton == null) return;
            
            if (IsValidHexColor(BorderColorHex.Text))
            {
                var color = ColorTranslator.FromHtml(BorderColorHex.Text);
                BorderColorButton.Background = new SolidColorBrush(System.Windows.Media.Color.FromRgb(color.R, color.G, color.B));
                DrawCanvas();
            }
        }
        
        private bool IsValidHexColor(string hex)
        {
            if (string.IsNullOrEmpty(hex)) return false;
            if (!hex.StartsWith("#")) hex = "#" + hex;
            return System.Text.RegularExpressions.Regex.IsMatch(hex, @"^#[0-9A-Fa-f]{6}$");
        }
        
        private void OnControlChanged(object sender, EventArgs e)
        {
            DrawCanvas();
        }
        
        private void DrawCanvas()
        {
            if (canvasBitmap == null) return;
            
            using (var g = Graphics.FromImage(canvasBitmap))
            {
                g.Clear(System.Drawing.Color.FromArgb(240, 240, 240));
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.TextRenderingHint = TextRenderingHint.AntiAlias;
                
                if (uploadedImage != null)
                {
                    DrawImage(g);
                }
                
                DrawBorder(g);
                DrawText(g);
            }
            
            UpdatePreviewImage();
        }
        
        private void DrawImage(Graphics g)
        {
            if (uploadedImage == null) return;
            
            using (var ms = new MemoryStream())
            {
                var encoder = new PngBitmapEncoder();
                encoder.Frames.Add(BitmapFrame.Create(uploadedImage));
                encoder.Save(ms);
                ms.Position = 0;
                
                using (var img = System.Drawing.Image.FromStream(ms))
                {
                    float scale;
                    if (fitMode == "contain")
                    {
                        scale = Math.Min(1280f / img.Width, 670f / img.Height);
                    }
                    else
                    {
                        scale = Math.Max(1280f / img.Width, 670f / img.Height);
                    }
                    
                    float scaledWidth = img.Width * scale;
                    float scaledHeight = img.Height * scale;
                    float x = (1280 - scaledWidth) / 2 + (float)imageOffsetX;
                    float y = (670 - scaledHeight) / 2 + (float)imageOffsetY;
                    
                    g.SetClip(new Rectangle(0, 0, 1280, 670));
                    g.DrawImage(img, x, y, scaledWidth, scaledHeight);
                    g.ResetClip();
                }
            }
        }
        
        private void DrawBorder(Graphics g)
        {
            if (BorderWidthSlider == null || BorderColorHex == null) return;
            
            int borderWidth = (int)BorderWidthSlider.Value;
            if (borderWidth > 0)
            {
                if (IsValidHexColor(BorderColorHex.Text))
                {
                    var borderColor = ColorTranslator.FromHtml(BorderColorHex.Text);
                    using (var pen = new System.Drawing.Pen(borderColor, borderWidth))
                    {
                        g.DrawRectangle(pen, borderWidth / 2, borderWidth / 2, 
                                       1280 - borderWidth, 670 - borderWidth);
                    }
                }
            }
        }
        
        private void DrawText(Graphics g)
        {
            if (TitleText == null || FontSizeSlider == null || FontColorHex == null || 
                TextPositionCombo == null || TextBackgroundCheck == null || TextShadowCheck == null) return;
            
            string text = TitleText.Text?.Trim() ?? "";
            if (string.IsNullOrEmpty(text)) return;
            
            if (!IsValidHexColor(FontColorHex.Text)) return;
            
            float fontSize = (float)FontSizeSlider.Value;
            var fontColor = ColorTranslator.FromHtml(FontColorHex.Text);
            
            using (var font = new Font("Meiryo", fontSize, System.Drawing.FontStyle.Bold))
            {
                var format = new StringFormat
                {
                    Alignment = StringAlignment.Center,
                    LineAlignment = StringAlignment.Center
                };
                
                float textY;
                switch (TextPositionCombo.SelectedIndex)
                {
                    case 1: // Top
                        textY = 670 * 0.2f;
                        break;
                    case 2: // Bottom
                        textY = 670 * 0.8f;
                        break;
                    default: // Center
                        textY = 670 / 2f;
                        break;
                }
                
                var textRect = new RectangleF(50, textY - 200, 1180, 400);
                
                if (TextBackgroundCheck.IsChecked == true)
                {
                    DrawTextBackground(g, text, font, textRect, format);
                }
                
                if (TextShadowCheck.IsChecked == true)
                {
                    g.TranslateTransform(3, 3);
                    using (var shadowBrush = new SolidBrush(System.Drawing.Color.FromArgb(180, 0, 0, 0)))
                    {
                        g.DrawString(text, font, shadowBrush, textRect, format);
                    }
                    g.TranslateTransform(-3, -3);
                }
                
                using (var brush = new SolidBrush(fontColor))
                {
                    g.DrawString(text, font, brush, textRect, format);
                }
            }
        }
        
        private void DrawTextBackground(Graphics g, string text, Font font, RectangleF textRect, StringFormat format)
        {
            if (TextPaddingSlider == null) return;
            
            var size = g.MeasureString(text, font, (int)textRect.Width, format);
            int padding = (int)TextPaddingSlider.Value;
            
            var bgRect = new RectangleF(
                textRect.X + (textRect.Width - size.Width) / 2 - padding,
                textRect.Y + (textRect.Height - size.Height) / 2 - padding,
                size.Width + padding * 2,
                size.Height + padding * 2
            );
            
            if (BorderColorHex == null || !IsValidHexColor(BorderColorHex.Text)) return;
            var bgColor = ColorTranslator.FromHtml(BorderColorHex.Text);
            using (var brush = new SolidBrush(System.Drawing.Color.FromArgb(200, bgColor)))
            {
                float radius = 10;
                var path = GetRoundedRectangle(bgRect, radius);
                g.FillPath(brush, path);
            }
        }
        
        private GraphicsPath GetRoundedRectangle(RectangleF rect, float radius)
        {
            var path = new GraphicsPath();
            path.AddArc(rect.X, rect.Y, radius * 2, radius * 2, 180, 90);
            path.AddArc(rect.Right - radius * 2, rect.Y, radius * 2, radius * 2, 270, 90);
            path.AddArc(rect.Right - radius * 2, rect.Bottom - radius * 2, radius * 2, radius * 2, 0, 90);
            path.AddArc(rect.X, rect.Bottom - radius * 2, radius * 2, radius * 2, 90, 90);
            path.CloseFigure();
            return path;
        }
        
        private void UpdatePreviewImage()
        {
            if (canvasBitmap == null) return;
            
            using (var ms = new MemoryStream())
            {
                canvasBitmap.Save(ms, ImageFormat.Png);
                ms.Position = 0;
                
                var image = new BitmapImage();
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.StreamSource = ms;
                image.EndInit();
                
                PreviewImage.Source = image;
            }
        }
        
        private void PreviewImage_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (uploadedImage == null) return;
            
            if (fitMode == "contain")
            {
                fitMode = "cover";
                imageOffsetX = 0;
                imageOffsetY = 0;
                DrawCanvas();
            }
            else
            {
                isDragging = true;
                hasDragged = false;
                dragStart = e.GetPosition(PreviewImage);
                PreviewImage.CaptureMouse();
            }
        }
        
        private void PreviewImage_MouseMove(object sender, MouseEventArgs e)
        {
            if (!isDragging || uploadedImage == null) return;
            
            var currentPos = e.GetPosition(PreviewImage);
            var deltaX = currentPos.X - dragStart.X;
            var deltaY = currentPos.Y - dragStart.Y;
            
            if (Math.Abs(deltaX) > 2 || Math.Abs(deltaY) > 2)
            {
                hasDragged = true;
            }
            
            var scaleX = 1280.0 / PreviewImage.ActualWidth;
            var scaleY = 670.0 / PreviewImage.ActualHeight;
            
            imageOffsetX += deltaX * scaleX;
            imageOffsetY += deltaY * scaleY;
            
            // Limit offsets
            using (var ms = new MemoryStream())
            {
                var encoder = new PngBitmapEncoder();
                encoder.Frames.Add(BitmapFrame.Create(uploadedImage));
                encoder.Save(ms);
                ms.Position = 0;
                
                using (var img = System.Drawing.Image.FromStream(ms))
                {
                    float scale = Math.Max(1280f / img.Width, 670f / img.Height);
                    float scaledWidth = img.Width * scale;
                    float scaledHeight = img.Height * scale;
                    
                    double maxOffsetX = Math.Max(0, (scaledWidth - 1280) / 2);
                    double maxOffsetY = Math.Max(0, (scaledHeight - 670) / 2);
                    
                    imageOffsetX = Math.Max(-maxOffsetX, Math.Min(maxOffsetX, imageOffsetX));
                    imageOffsetY = Math.Max(-maxOffsetY, Math.Min(maxOffsetY, imageOffsetY));
                }
            }
            
            dragStart = currentPos;
            DrawCanvas();
        }
        
        private void PreviewImage_MouseUp(object sender, MouseButtonEventArgs e)
        {
            if (isDragging)
            {
                isDragging = false;
                PreviewImage.ReleaseMouseCapture();
                
                if (!hasDragged && fitMode == "cover")
                {
                    fitMode = "contain";
                    imageOffsetX = 0;
                    imageOffsetY = 0;
                    DrawCanvas();
                }
            }
        }
        
        private void PreviewImage_MouseLeave(object sender, MouseEventArgs e)
        {
            if (isDragging)
            {
                isDragging = false;
                PreviewImage.ReleaseMouseCapture();
            }
        }
        
        private void DownloadButton_Click(object sender, RoutedEventArgs e)
        {
            if (canvasBitmap == null) return;
            
            var saveFileDialog = new SaveFileDialog
            {
                Filter = "PNG Image|*.png",
                FileName = "note-title.png"
            };
            
            if (saveFileDialog.ShowDialog() == true)
            {
                canvasBitmap.Save(saveFileDialog.FileName, ImageFormat.Png);
                MessageBox.Show("画像を保存しました", "完了", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }
        
        private void CopyImageButton_Click(object sender, RoutedEventArgs e)
        {
            if (canvasBitmap == null) return;
            
            try
            {
                using (var ms = new MemoryStream())
                {
                    canvasBitmap.Save(ms, ImageFormat.Png);
                    ms.Position = 0;
                    
                    var image = new BitmapImage();
                    image.BeginInit();
                    image.CacheOption = BitmapCacheOption.OnLoad;
                    image.StreamSource = ms;
                    image.EndInit();
                    
                    Clipboard.SetImage(image);
                    
                    CopyImageButton.Content = "コピーしました！";
                    var timer = new System.Windows.Threading.DispatcherTimer();
                    timer.Interval = TimeSpan.FromSeconds(2);
                    timer.Tick += (s, args) =>
                    {
                        CopyImageButton.Content = "画像をコピー";
                        timer.Stop();
                    };
                    timer.Start();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"クリップボードへのコピーに失敗しました: {ex.Message}", 
                               "エラー", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private void CopyUrlButton_Click(object sender, RoutedEventArgs e)
        {
            SaveSettings();
            CopyUrlButton.Content = "保存しました！";
            var timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(2);
            timer.Tick += (s, args) =>
            {
                CopyUrlButton.Content = "設定を保存";
                timer.Stop();
            };
            timer.Start();
        }
        
        private void SaveSettings()
        {
            // In a native app, we would save settings to registry or config file
            // For now, we'll just show a message
            var settings = new
            {
                FontSize = FontSizeSlider.Value,
                FontColor = FontColorHex.Text,
                BorderColor = BorderColorHex.Text,
                BorderWidth = BorderWidthSlider.Value,
                TextPosition = TextPositionCombo.SelectedIndex,
                TextShadow = TextShadowCheck.IsChecked,
                TextBackground = TextBackgroundCheck.IsChecked,
                TextPadding = TextPaddingSlider.Value
            };
            
            // Here you could save to registry or app settings
            // In a future version, implement proper settings storage
        }
    }
}