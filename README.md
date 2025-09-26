# Leica Gallery

A web gallery for viewing photos taken with Leica cameras.

**Site**: [leica.ash84.io](https://leica.ash84.io)

## Features

- Responsive web gallery
- WebP optimized image display
- Modern and clean UI
- Fast loading speed

## Development Setup

### Required Tools
- `cwebp` (for WebP conversion)
  ```bash
  # macOS
  brew install webp
  
  # Ubuntu/Debian
  sudo apt-get install webp
  ```

### Project Structure
```
leica/
├── docs/                    # GitHub Pages deployment
│   ├── images/             # Image files
│   │   ├── manifest.json   # Image list
│   │   └── *.webp         # WebP images
│   ├── css/
│   ├── js/
│   └── index.html
├── Makefile                # Image conversion automation
└── README.md
```

## Usage

### Adding New Images

1. **Prepare Image Files**
   ```bash
   # Add JPG/PNG files to docs/images/ folder
   cp your-photo.jpg docs/images/
   ```

2. **Convert to WebP**
   ```bash
   # Convert all JPG/PNG to WebP
   make convert
   ```

3. **Update manifest.json**
   ```bash
   # Add new filename to docs/images/manifest.json
   # Example: add "IMG_6530.webp" format
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add new images"
   git push
   ```

### Makefile Commands

```bash
make convert    # Convert all JPG/PNG to WebP
make clean      # Delete generated WebP files  
make help       # Show usage help
```

## Deployment

Automatically deployed via GitHub Pages.
- Site updates automatically when pushed to main branch.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Image Optimization**: WebP (cwebp)
- **Deployment**: GitHub Pages
- **Automation**: Make

---

Contact: ash84.io