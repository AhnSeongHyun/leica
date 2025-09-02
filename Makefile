# Makefile for converting images to WebP format using cwebp

# Image directory
IMAGES_DIR = docs/images

# Find all JPG and PNG files in the images directory
JPG_FILES = $(wildcard $(IMAGES_DIR)/*.jpg $(IMAGES_DIR)/*.JPG)
PNG_FILES = $(wildcard $(IMAGES_DIR)/*.png $(IMAGES_DIR)/*.PNG)
ALL_IMAGE_FILES = $(JPG_FILES) $(PNG_FILES)

# Convert to WebP filenames (replace extension with .webp)
WEBP_FILES = $(ALL_IMAGE_FILES:%.jpg=%.webp)
WEBP_FILES := $(WEBP_FILES:%.JPG=%.webp)
WEBP_FILES := $(WEBP_FILES:%.png=%.webp)
WEBP_FILES := $(WEBP_FILES:%.PNG=%.webp)

# Default target
.PHONY: all convert clean help

all: convert

# Convert all JPG and PNG files to WebP
convert: $(WEBP_FILES)
	@echo "✅ 모든 이미지가 WebP로 변환되었습니다."

# Rule to convert individual files to WebP
%.webp: %.jpg
	@echo "🔄 변환 중: $< -> $@"
	@cwebp -q 80 "$<" -o "$@"

%.webp: %.JPG
	@echo "🔄 변환 중: $< -> $@"
	@cwebp -q 80 "$<" -o "$@"

%.webp: %.png
	@echo "🔄 변환 중: $< -> $@"
	@cwebp -q 80 "$<" -o "$@"

%.webp: %.PNG
	@echo "🔄 변환 중: $< -> $@"
	@cwebp -q 80 "$<" -o "$@"

# Clean up WebP files
clean:
	@echo "🧹 WebP 파일들을 삭제합니다..."
	@rm -f $(WEBP_FILES)
	@echo "✅ 정리 완료"

# Show help
help:
	@echo "사용 가능한 명령어:"
	@echo "  make convert  - 모든 JPG/PNG 파일을 WebP로 변환"
	@echo "  make clean    - 생성된 WebP 파일들 삭제"
	@echo "  make help     - 이 도움말 표시"
	@echo ""
	@echo "변환할 파일들:"
	@echo "  JPG 파일: $(JPG_FILES)"
	@echo "  PNG 파일: $(PNG_FILES)"
