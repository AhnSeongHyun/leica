# 📷 Images Directory

라이카 갤러리에 표시할 사진들을 관리하는 폴더입니다.

## 📁 현재 구조
```
images/
├── manifest.json           # 이미지 목록 (자동 생성되는 파일 아님)
├── IMG_*.webp             # WebP 변환된 이미지들
└── README.md              # 이 파일
```

## 🔄 새 이미지 추가 워크플로우

### 1단계: 원본 이미지 추가
```bash
# JPG 또는 PNG 파일을 이 폴더에 복사
cp ~/Desktop/IMG_6531.jpg docs/images/
```

### 2단계: WebP 변환 (루트 디렉토리에서 실행)
```bash
# 프로젝트 루트로 이동
cd /path/to/leica

# Makefile을 사용해 자동 변환
make convert

# 또는 수동 변환
cwebp -q 80 docs/images/IMG_6531.jpg -o docs/images/IMG_6531.webp
```

### 3단계: manifest.json 업데이트
`manifest.json` 파일을 편집해서 새 이미지를 배열에 추가:
```json
[
    "IMG_5751.webp",
    "IMG_5755.webp",
    ...
    "IMG_6530.webp",
    "IMG_6531.webp"  ← 새로 추가
]
```

### 4단계: Git 커밋
```bash
git add docs/images/
git commit -m "📸 Add IMG_6531 to gallery"
git push
```

## ⚙️ Makefile 명령어 (루트에서 실행)

| 명령어 | 설명 |
|--------|------|
| `make convert` | 모든 JPG/PNG를 WebP로 변환 |
| `make clean` | 생성된 WebP 파일들 삭제 |
| `make help` | 사용법 도움말 표시 |

## 📋 파일 명명 규칙
- **원본**: `IMG_XXXX.jpg` 또는 `IMG_XXXX.png`
- **변환후**: `IMG_XXXX.webp`
- **manifest.json**: 파일명만 저장 (경로 제외)

## 🎯 권장 사항
- **파일 형식**: JPG, PNG (원본) → WebP (최종)
- **이미지 크기**: 1920px 이상 권장
- **WebP 품질**: 80% (Makefile 기본값)
- **파일 크기**: 변환 후 보통 30-50% 감소

## 🔍 manifest.json이란?

갤러리 JavaScript에서 표시할 이미지 목록을 정의하는 JSON 파일입니다.
- 배열 형태로 WebP 파일명들을 저장
- 순서대로 갤러리에 표시됨
- 새 이미지 추가 시 **반드시 수동으로 업데이트 필요**

## ⚠️ 주의사항
- 원본 JPG/PNG 파일은 변환 후 삭제하지 마세요 (백업용)
- manifest.json 업데이트를 잊지 마세요
- 파일명에 특수문자나 공백 사용 금지