# Images Directory

Folder for managing photos to be displayed in the Leica gallery.

## Current Structure
```
images/
├── manifest.json           # Image list (not auto-generated)
├── IMG_*.webp             # WebP converted images
└── README.md              # This file
```

## New Image Addition Workflow

### Step 1: Add Original Images
```bash
# Copy JPG or PNG files to this folder
cp ~/Desktop/IMG_6531.jpg docs/images/
```

### Step 2: WebP Conversion (run from root directory)
```bash
# Navigate to project root
cd /path/to/leica

# Auto convert using Makefile
make convert

# Or manual conversion
cwebp -q 80 docs/images/IMG_6531.jpg -o docs/images/IMG_6531.webp
```

### Step 3: Update manifest.json
Edit the `manifest.json` file to add new images to the array:
```json
[
    "IMG_5751.webp",
    "IMG_5755.webp",
    ...
    "IMG_6530.webp",
    "IMG_6531.webp"  ← newly added
]
```

### Step 4: Git Commit
```bash
git add docs/images/
git commit -m "Add IMG_6531 to gallery"
git push
```

## Makefile Commands (run from root)

| Command | Description |
|---------|-------------|
| `make convert` | Convert all JPG/PNG to WebP |
| `make clean` | Delete generated WebP files |
| `make help` | Show usage help |

## File Naming Convention
- **Original**: `IMG_XXXX.jpg` or `IMG_XXXX.png`
- **Converted**: `IMG_XXXX.webp`
- **manifest.json**: Store filename only (no path)

## Recommendations
- **File Format**: JPG, PNG (original) → WebP (final)
- **Image Size**: 1920px or higher recommended
- **WebP Quality**: 80% (Makefile default)
- **File Size**: Usually 30-50% reduction after conversion

## What is manifest.json?

A JSON file that defines the list of images to display in the gallery JavaScript.
- Stores WebP filenames in array format
- Images displayed in order
- **Must be manually updated when adding new images**

## Important Notes
- Do not delete original JPG/PNG files after conversion (for backup)
- Don't forget to update manifest.json
- Avoid special characters or spaces in filenames