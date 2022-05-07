breakpoints.on('<=xsmall', function () {
    reloadVideosOnSizeUpdate('xsmall');
});
breakpoints.on('<=small', function () {
    reloadVideosOnSizeUpdate('small');
});
breakpoints.on('<=medium', function () {
    reloadVideosOnSizeUpdate('medium');
});
breakpoints.on('<=xlarge', function () {
    reloadVideosOnSizeUpdate('large');
});

breakpoints.on('>xsmall', function () {
    reloadVideosOnSizeUpdate('small');
});
breakpoints.on('>small', function () {
    reloadVideosOnSizeUpdate('medium');
});
breakpoints.on('>medium', function () {
    reloadVideosOnSizeUpdate('large');
});
breakpoints.on('>xlarge', function () {
    reloadVideosOnSizeUpdate('xlarge');
});

    //video auto resolution
	var video = $('video');
	var videoSizes = {
		'normal': {
			'xsmall': '/content/images/videos/225/',
			'small': '/content/images/videos/360/',
			'medium': '/content/images/videos/480/',
			'large': '/content/images/videos/720/',
			'xlarge': '/content/images/videos/1080/'
		},
		'half': {
			'xsmall': '/content/images/videos/225/',
			'small': '/content/images/videos/360/',
			'medium': '/content/images/videos/225/',
			'large': '/content/images/videos/225/',
			'xlarge': '/content/images/videos/225/'
		},
	};
	var imageMimeTypes = {
		'gif': 'image/gif',
		'jpeg': 'image/jpeg',
		'jpg': 'image/jpeg',
		'jpe': 'image/jpeg',
		'jfif': 'image/jpeg',
		'png': 'image/png',
		'svg': 'image/svg+xml',
		'webp': 'image/webp',
		'jxl': 'image/jxl',
		'avif': 'image/avif'
	}
	var fallbackImageType = [
		'svg', 'jpeg', 'jpg', 'png', 'gif'
	];

	var defaultImageLink = '/content/images/size/';
	var imageMediaCalls = {
		'normal': ['300', '400', '500', '600', '700', '800', '1000', '1200', '1500'],
		'half': ['300', '400', '500', '600', '700'],
		'gallery': ['200', '300', '400', '500', '600'],
		'bookmark': ['300', '400', '500', '600'],
		'full': ['400', '500', '600', '700', '800', '900', '1000', '1150', '1500', '2000'],
		'partner': ['200', '300', '400'],
	};
	var imageSizeAttribute = {
		'normal': '(min-width: 2281px) 1500px, (min-width: 1681px) 1200px, (min-width: 900px) 720px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
		'half': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
		'gallery': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
		'bookmark': '(min-width: 2281px) 600px, (min-width: 1681px) 480px, (min-width: 737px) 300px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
		'full': '(min-width: 2281px) 2000px, (min-width: 1681px) 1536px, (min-width: 1281px) 1152px, (min-width: 981px) 1056px, (min-width: 481px) 70vw, 100vw',
		'partner': '(min-width: 1681px) 300px, (min-width: 737px) 200px, (min-width: 567px) 35vw, 200px'
	}

function reloadVideosOnSizeUpdate(size) {
    for (var i = 0; i < video.length; i++) {
        if (video[i].src === '' && linkIsOnsite(video[i].children[0].src)) {
            var layoutType = 'normal';
            if (video[i].parentNode.parentNode.classList.contains('kg-width-half')) {
                layoutType = 'half'
            }
            video[i].children[0].src = replaceLink(videoSizes[layoutType], size, video[i].children[0].src);
            video[i].load();
        }
    }
}

function replaceLink(links, size, currentLink) {
    var path = currentLink.match(/[\d\w+-.]+$/g);
    if (path !== undefined && path != null) {
        return links[size] + path[0];
    }
    return currentLink;
}
	//auto image resolution
	var images = $('img');
	for (var i = 0; i < images.length; i++) {
		var fullSrc = images[i].src;
		if (linkIsOnsite(fullSrc)) {
			fullSrc = createSubLink(images[i].src, '');
		}
		if (images[i].parentNode.tagName !== 'A') {
			images[i].setAttribute('data-link', fullSrc);
		}
	}