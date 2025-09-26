# Leica Gallery 📸

라이카 카메라로 촬영한 사진들을 웹에서 감상할 수 있는 갤러리 사이트입니다.

🌐 **사이트**: [leica.ash84.io](https://leica.ash84.io)

## 주요 기능

- 📱 반응형 웹 갤러리 
- 🖼️ WebP 최적화된 이미지 표시
- 🎨 모던하고 깔끔한 UI
- ⚡ 빠른 로딩 속도

## 개발 환경 설정

### 필수 도구
- `cwebp` (WebP 변환용)
  ```bash
  # macOS
  brew install webp
  
  # Ubuntu/Debian
  sudo apt-get install webp
  ```

### 프로젝트 구조
```
leica/
├── docs/                    # GitHub Pages 배포용
│   ├── images/             # 이미지 파일들
│   │   ├── manifest.json   # 이미지 목록
│   │   └── *.webp         # WebP 이미지들
│   ├── css/
│   ├── js/
│   └── index.html
├── Makefile                # 이미지 변환 자동화
└── README.md
```

## 사용법

### 새 이미지 추가하기

1. **이미지 파일 준비**
   ```bash
   # docs/images/ 폴더에 JPG/PNG 파일 추가
   cp your-photo.jpg docs/images/
   ```

2. **WebP로 변환**
   ```bash
   # 모든 JPG/PNG를 WebP로 변환
   make convert
   ```

3. **manifest.json 업데이트**
   ```bash
   # docs/images/manifest.json에 새 파일명 추가
   # 예: "IMG_6530.webp" 형태로 추가
   ```

4. **변경사항 커밋**
   ```bash
   git add .
   git commit -m "📸 Add new images"
   git push
   ```

### Makefile 명령어

```bash
make convert    # 모든 JPG/PNG를 WebP로 변환
make clean      # 생성된 WebP 파일들 삭제  
make help       # 사용법 도움말 표시
```

## 배포

GitHub Pages를 통해 자동 배포됩니다.
- 메인 브랜치에 푸시하면 자동으로 사이트가 업데이트됩니다.

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **이미지 최적화**: WebP (cwebp)
- **배포**: GitHub Pages
- **자동화**: Make

---

📧 문의: ash84.io