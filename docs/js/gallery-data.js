// images 디렉토리의 파일을 기반으로 갤러리를 동적으로 구성합니다.
// 정적 호스팅 환경(GitHub Pages 등)에서는 디렉토리 인덱싱이 불가하므로
// `docs/images/manifest.json` 파일을 참고합니다.
// manifest가 없을 경우 현재 레포의 파일명을 기반으로 한 폴백 리스트로 동작합니다.

(function() {
	const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'];

	function stripExtension(filename) {
		const lastDot = filename.lastIndexOf('.');
		return lastDot > 0 ? filename.substring(0, lastDot) : filename;
	}

	function toTitleCaseFromFilename(filename) {
		const base = stripExtension(filename)
			.replace(/[_-]+/g, ' ')
			.replace(/^IMG\s*/i, '')
			.trim();
		if (!base) return filename;
		return base.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
	}

	function buildPhotoObject(fileName, index) {
		return {
			id: index + 1,
			src: `images/${fileName}`,
			title: toTitleCaseFromFilename(fileName),
			date: '',
			caption: ''
		};
	}

	function loadManifest() {
		return fetch('images/manifest.json', { cache: 'no-store' }).then((res) => {
			if (!res.ok) throw new Error('manifest not found');
			return res.json();
		});
	}

	// 현재 저장소에 존재하는 파일명을 기준으로 한 폴백
	const fallbackFiles = [
		'IMG_5751.JPG',
		'IMG_5755.JPG',
		'IMG_5764.JPG',
		'IMG_5814.JPG'
	];

	function isImageFile(name) {
		return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
	}

	window.galleryPhotosReady = loadManifest()
		.catch(() => fallbackFiles)
		.then((files) => {
			const valid = Array.isArray(files) ? files.filter(isImageFile) : [];
			const photos = valid.map((name, idx) => buildPhotoObject(name, idx));
			window.galleryPhotos = photos;
			return photos;
		});
})();