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

	// 이미지별 커스텀 제목 정의
	const customTitles = {
		'IMG_5751.JPG': 'Street Life',
		'IMG_5755.JPG': 'Urban Moments',
		'IMG_5764.JPG': 'City Reflections',
		'IMG_5814.JPG': 'Daily Beauty',
		'IMG_5818.JPG': 'Life\'s Details',
		'IMG_5819.JPG': 'Simple Pleasures',
		'IMG_5820.JPG': 'Everyday Magic',
		'IMG_5995.JPG': 'Urban Landscape',
		'IMG_5996.JPG': 'City Lights',
		'IMG_5997.JPG': 'Street Photography',
		'IMG_5998.JPG': 'Urban Geometry',
		'IMG_5999.JPG': 'City Patterns',
		'IMG_6017.JPG': 'Street Art',
		'IMG_6018.JPG': 'Urban Texture',
		'IMG_6019.JPG': 'City Rhythm',
		'IMG_6020.JPG': 'Street Stories',
		'IMG_6021.JPG': 'Urban Moments',
		'IMG_6022.JPG': 'City Life',
		'IMG_6023.JPG': 'Street Scenes',
		'IMG_6024.JPG': 'Urban Beauty',
		'IMG_6025.JPG': 'City Details',
		'IMG_6026.JPG': 'Street Views'
	};

	function toTitleCaseFromFilename(filename) {
		// 커스텀 제목이 있으면 사용
		if (customTitles[filename]) {
			return customTitles[filename];
		}
		
		const base = stripExtension(filename)
			.replace(/^IMG_\d+$/i, '') // IMG_숫자 패턴 완전 제거
			.replace(/^IMG\s*/i, '') // 남은 IMG 접두사 제거
			.replace(/[_-]+/g, ' ')
			.trim();
		if (!base) return 'Untitled'; // 빈 문자열인 경우 기본값 반환
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
		// 로컬 환경에서는 XMLHttpRequest를 사용하여 CORS 문제를 피함
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', 'images/manifest.json', true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						try {
							const data = JSON.parse(xhr.responseText);
							resolve(data);
						} catch (e) {
							console.warn('Failed to parse manifest.json, using fallback:', e);
							reject(new Error('JSON parse error'));
						}
					} else {
						console.warn('manifest.json not found (status:', xhr.status, '), using fallback');
						reject(new Error('manifest not found'));
					}
				}
			};
			xhr.onerror = function() {
				console.warn('Failed to load manifest.json, using fallback');
				reject(new Error('manifest not found'));
			};
			xhr.send();
		});
	}

	// 현재 저장소에 존재하는 파일명을 기준으로 한 폴백
	const fallbackFiles = [
		'IMG_5751.webp',
		'IMG_5755.webp',
		'IMG_5764.webp',
		'IMG_5814.webp',
		'IMG_5818.webp',
		'IMG_5819.webp',
		'IMG_5820.webp',
		'IMG_5995.webp',
		'IMG_5996.webp',
		'IMG_5997.webp',
		'IMG_5998.webp',
		'IMG_5999.webp',
		'IMG_6017.webp',
		'IMG_6018.webp',
		'IMG_6019.webp',
		'IMG_6020.webp',
		'IMG_6021.webp',
		'IMG_6022.webp',
		'IMG_6023.webp',
		'IMG_6024.webp',
		'IMG_6025.webp',
		'IMG_6026.webp'
	];

	function isImageFile(name) {
		return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
	}

	window.galleryPhotosReady = loadManifest()
		.then((files) => {
			console.log('✅ manifest.json loaded successfully, found', files.length, 'images');
			return files;
		})
		.catch((error) => {
			console.log('⚠️ manifest.json not available, using fallback list with', fallbackFiles.length, 'images');
			console.log('Error details:', error.message);
			return fallbackFiles;
		})
		.then((files) => {
			const valid = Array.isArray(files) ? files.filter(isImageFile) : [];
			const photos = valid.map((name, idx) => buildPhotoObject(name, idx));
			window.galleryPhotos = photos;
			console.log('📸 Gallery initialized with', photos.length, 'photos');
			return photos;
		});
})();