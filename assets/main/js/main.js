'use strict';
/*
	Massively by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$nav = $('#nav'),
		$main = $('#main'),
		$navPanelToggle, $navPanel, $navPanelInner;

	// Breakpoints.
	var breakPointSource = {
		default:   ['1681px',   null       ],
		xlarge:    ['1281px',   '1680px'   ],
		large:     ['981px',    '1280px'   ],
		medium:    ['737px',    '980px'    ],
		small:     ['481px',    '736px'    ],
		xsmall:    ['361px',    '480px'    ],
		xxsmall:   [null,       '360px'    ]
	}
	breakpoints(breakPointSource);
	
	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = function(intensity) {
		var	$window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i=0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.1;

		$this.each(function() {

			var $t = $(this),
				$bg = $('<div class="bg"></div>').appendTo($t), off;

			off = function() {

				$bg
					.addClass('fixed')
					.css('transform', 'none');

				$window
					.off('scroll._parallax');

			};

			off();
		});

		$window
			.off('load._parallax resize._parallax')
			.on('load._parallax resize._parallax', function() {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Scrolly.
		$('.scrolly').scrolly();

	// Background.
		$wrapper._parallax(0.925);

	// Nav Panel.

		// Toggle.
			$navPanelToggle = $(
				'<a href="#navPanel" id="navPanelToggle">Menu</a>'
			)
				.appendTo($wrapper);

			// Change toggle styling once we've scrolled past the header.
				$header.scrollex({
					bottom: '5vh',
					enter: function() {
						$navPanelToggle.removeClass('alt');
						$nav.removeClass('alt')
					},
					leave: function() {
						$navPanelToggle.addClass('alt');
						$nav.addClass('alt');
					}
				});

		// Panel.
			$navPanel = $(
				'<div id="navPanel">' +
					'<nav>' +
					'</nav>' +
					'<a href="#navPanel" class="close"></a>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'right',
					target: $body,
					visibleClass: 'is-navPanel-visible'
				});

			// Get inner.
				$navPanelInner = $navPanel.children('nav');

			// Move nav content on breakpoint change.
				var $navContent = $nav.children();

				breakpoints.on('>medium', function() {

					// NavPanel -> Nav.
						$navContent.appendTo($nav);

					// Flip icon classes.
						$nav.find('.icons, .icon')
							.removeClass('alt');

				});

				breakpoints.on('<=medium', function() {

					// Nav -> NavPanel.
						$navContent.appendTo($navPanelInner);

					// Flip icon classes.
						$navPanelInner.find('.icons, .icon')
							.addClass('alt');

				});

			// Hack: Disable transitions on WP.
				if (browser.os == 'wp'
				&&	browser.osVersion < 10)
					$navPanel
						.css('transition', 'none');

	// Intro.
		var $intro = $('#intro');

		if ($intro.length > 0) {

			// Hack: Fix flex min-height on IE.
				if (browser.name == 'ie') {
					$window.on('resize.ie-intro-fix', function() {

						var h = $intro.height();

						if (h > $window.height())
							$intro.css('height', 'auto');
						else
							$intro.css('height', h);

					}).trigger('resize.ie-intro-fix');
				}

			// Hide intro on scroll (> small).
				breakpoints.on('>small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'bottom',
						top: '25vh',
						bottom: '-50vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

				});

			// Hide intro on scroll (<= small).
				breakpoints.on('<=small', function() {

					$main.unscrollex();

					$main.scrollex({
						mode: 'middle',
						top: '15vh',
						bottom: '-15vh',
						enter: function() {
							$intro.addClass('hidden');
						},
						leave: function() {
							$intro.removeClass('hidden');
						}
					});

			});

		}

	//video auto resolution
	var video = $('video');
	var videoSizes = {'normal': {
					'xsmall': '/content/images/videos/225/',
					'small': '/content/images/videos/360/',
					'medium': '/content/images/videos/480/',
					'large': '/content/images/videos/720/',
					'xlarge': '/content/images/videos/1080/'},
				'half': {
					'xsmall': '/content/images/videos/225/',
					'small': '/content/images/videos/360/',
					'medium': '/content/images/videos/225/',
					'large': '/content/images/videos/225/',
					'xlarge': '/content/images/videos/225/'},
				};
	var videoMimeTypes = {
		'mp4': 'video/mp4',
		'ogg': 'video/ogg',
		'ogv': 'video/ogv',
		'mov': 'video/quicktime',
		'webm': 'video/webm'
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
		'normal': ['300', '400', '500', '600', '700', '800'],
		'half': ['300', '400', '500', '600'],
		'bookmark': ['300', '400', '500', '600'],
		'full': ['400', '500', '600', '700', '800', '900', '1000'],
		'partner': ['200', '300'],
	};
	var imageSizeAttribute = {
		'normal': '(min-width 1680px) 1000px, (min-width 900px) 720px, (min-width 480px) 75vw, 90vw',
		'gallery': '(min-width 1680px) 320px, (min-width 980px) 236px, (max-width 981px) 720px, (min-width 900px) 720px, (min-width 480px) 75vw, 90vw',
		'bookmark': '(min-width 735px) 300px, (min-width 480px) 75vw, 90vw',
		'full': '100%',
		'partner': '(max-width: 560px) 200px, (max-width: 736px) 300px, (min-width: 737px) 200px, (min-width: 860px) 300px'
	}

	var i = 0;

	function reloadVideosOnSizeUpdate (size) {
		for (i = 0; i < video.length; i++) {
			if (linkIsOnsite(video[i].children[0].src)) {
				var layoutType = 'normal';
				if (video[i].parentNode.parentNode.classList.contains('kg-width-half')) {
					layoutType = 'half'
				}
				video[i].children[0].src = replaceLink(videoSizes[layoutType], size, video[i].children[0].src);
				video[i].load();
			}
		}
	}

	function replaceLink (links, size, currentLink) {
		var path = currentLink.match(/[\d\w+-.]+$/g);
		if (path !== undefined && path != null) {
			return links[size] + path[0];
		}
		return currentLink;
	}

	var cookieValue = 1;
	var cookieDaysAlive = 365;
	//video consent
	function setCookie(name,value,days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}
	function getCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

    function getFileType (href) {
        try {
			if (href !== undefined || href !== '') {
				var parsed = new URL(href);
				var match = parsed.pathname.match(/\.([\w]){1,}$/gi);

				if (match) {
					return match[0].replace('.', '').trim();
				}
				return '';
			}
		}
		catch (e) {
			console.log(e);
		}
        return '';
    }

	function linkIsOnsite(href) {
		return isRelativLink(href) !== undefined;
	}
	function isRelativLink(href) {
		if (href && href !== '') {
			var fileLink = href.match(/^\/.+/g);
			if (fileLink) {
				return true;
			}
			try {
				var url = new URL(href);
				if (location.host === url.host) {
					return false;
				}
			}
			catch (e) {
				console.log(e)
			}
		}
		return undefined;
	}

	function parseExtraData(nextSibling) {
		if (nextSibling !== '' && nextSibling !== undefined && nextSibling != null
			&& nextSibling.nodeName === "#text") {
			var parsed = JSON.parse(nextSibling.textContent);
			nextSibling.remove();
			return parsed;	
		}
		return {};
	}

	function getCurrentBreakpoint() {
		for (var size in breakPointSource) {
			if (breakpoints.active(size)) {
				return size;
			}
		}

	}

	//get all iframes

	var links = $('.content > p a:only-child');
	/* Setup unconverted Youtube-Links as iFrame */
	links.filter("[href*='https://www.youtube.com'], [href*='https://www.youtube-nocookie.com']")
		.each(createYoutubeEmbedFromLink);
	/*Setup unconverted Instagram-Link as Blockquote */
	links.filter("[href*='https://www.instagram.com']").each(createInstagramEmbedFromLink);


	var iframes = $('iframe');
	//get all youtube video iframes
	var youtube = iframes.filter("[src*='https://www.youtube.com'], [src*='https://www.youtube-nocookie.com']")
		.each(updateYoutubeLink);
	updateService('youtube', getCookie(`youtube-allowed`), false);
	//get all unactivated instagram embeds
	var instagram = $('blockquote.instagram-media').each(updateInstagramLink);
	updateService('instagram', getCookie(`instagram-allowed`), false);


	/*Setup unembedded video links */
	var currentBreakpoint = getCurrentBreakpoint();
	links.filter(function () {
		switch (getFileType($(this)[0].href)) {
			case 'mp4':
			case 'mov':
			case 'avi':
			case 'webm':
			case 'ogg':
				return true;
			default:
				return false;
		}
	}).each(createVideoCard);
	video = $('video');

	breakpoints.on('<=xsmall', function() {
		reloadVideosOnSizeUpdate('xsmall');
	});
	breakpoints.on('<=small', function() {
		reloadVideosOnSizeUpdate('small');
	});
	breakpoints.on('<=medium', function() {
		reloadVideosOnSizeUpdate('medium');
	});
	breakpoints.on('<=xlarge', function() {
		reloadVideosOnSizeUpdate('large');
	});

	breakpoints.on('>xsmall', function() {
		reloadVideosOnSizeUpdate('small');
	});
	breakpoints.on('>small', function() {
		reloadVideosOnSizeUpdate('medium');
	});	
	breakpoints.on('>medium', function() {
		reloadVideosOnSizeUpdate('large');
	});
	breakpoints.on('>xlarge', function() {
		reloadVideosOnSizeUpdate('xlarge');
	});

	/*Setup umbedded image links */
	links.filter(function () {
		switch (getFileType($(this)[0].href)) {
			case 'jpg':
			case 'jpeg':
			case 'jfif':
			case 'png':
			case 'avif':
			case 'webp':
			case 'gif':
			case 'jxl':
			case 'svg':
				return true;
			default:
				return false;
		}
	}).each(createImageCard);



	/**
	 * Common generation functions 
	 */
	function generateEmbedFigure(extraClasses) {
		return `<figure class="kg-card kg-embed-card ${extraClasses}"></figure>`;
	}
	function generateFigureCaption(caption) {
		return `<figcaption>${caption}</figcaption>`;
	}

	
	/**
	 * Consent functions
	 */
	//german for now
	function generateEmbedConsentText(service, link, gdprLink) {
		var lowerCaseService = service.toLowerCase();
		return `<div class="kg-consent-container">
			<div class="kg-consent">
				<strong>${service}-DSGVO Auswahl</strong>
				<p>Diese Website verwendet ${service} um Inhalte zu ergänzen. Um Ihre Daten zu bestmöglich zu schützen ist die Anzeige standardmäßig deaktiviert.</p>
				<p>Beim Click auf den Anzeigen-Button stimmen Sie der <a href="${gdprLink}#${lowerCaseService}-datenschutzerklaerung" target="_blank">Datenschutzerklärung</a> von ${service} zu, die Einstellung wird in einem Cookie gespeichert und seitenweit aktiviert. Die Einstellung kann in der <a href="${gdprLink}" target="_blank">Datenschutzerklärung</a> deaktiviert werden.</p>
				<span class="kg-consent-interface">
					<button class="consent-button" data-service="${lowerCaseService}">Inhalte anzeigen</button>
					<a href="${link}" target="_blank"><button>In ${service} öffnen</button></a>
				</span>
			</div>
		</div>`;
	}
	

	function createConsentButtonListener(service) {
		$(`.consent-button[data-service="${service}"]`).on('click', consentGiven);
	}
	function consentGiven() {
		updateService($(this)[0].getAttribute('data-service'), true, true);
	}

	function updateService(service, active, isEvent) {	
		$('.instagram-media + script').remove();
		if (active) {
			switch (service) {
				case 'youtube':
					youtube.each(enableYoutube);
					break;
				case 'instagram':
					$('html').append('<script async src="//www.instagram.com/embed.js"></script>')
					if (isEvent) {
						location.reload(true);
					}
					break;
				default:
					break;
			}
			removeConsent(service);
			setCookie(`${service}-allowed`, cookieValue, cookieDaysAlive);
		} else {
			switch (service) {
				case 'youtube':
					youtube.each(disableYoutube);
					break;
				case 'instagram':
					$('.instagram-media + script').remove();
					instagram.each(disableInstagram);
					break;
				default:			
					break;
			}
			createConsentButtonListener(service);
		}
		

	}
	function removeConsent(service) {
		$(`[data-service="${service}"]`).parents('.kg-consent-container').remove();
	}

	/**
	 * Create video card
	 */
	function createVideoCard() {
		var href = $(this)[0].href;
		if ($(this).parent().is('p')) {
			$(this).unwrap();
		}
		var extraData = parseExtraData($(this)[0].nextSibling);
		var fileType = getFileType(href);
		
		var source = videoSource(href, fileType);

		if (extraData.alternativeFileTypes && extraData.alternativeFileTypes.length) {
			var i = 0;
			for (i = 0; i < extraData.alternativeFileTypes.length; i++) {
				if (videoMimeTypes[extraData.alternativeFileTypes[i]]) {
					var altHref = href.replace(fileType, extraData.alternativeFileTypes[i]);
					if (fileType !== extraData.alternativeFileTypes[i]) {
						source += videoSource(altHref, extraData.alternativeFileTypes[i]);
					}
				}
			}
		}
		var style = '';
		if (extraData.aspectRatio) {
			var aspectRatio = extraData.aspectRatio.match(/^\d+\/\d+$/);
			if (aspectRatio.length) {
				aspectRatio = aspectRatio[0].split('/');
				style += `padding-bottom:${aspectRatio[1]*100/aspectRatio[0]}%;`
			}
		}
		style = style.replace(/\s/g, '');
		
		var loop = true;
		if (extraData.loop && (extraData.loop === true || extraData.loop === false)) {
			loop = extraData.loop;
		}
		var autoplay = true;
		if (autoplay.loop && (autoplay.loop === true || autoplay.loop === false)) {
			autoplay = autoplay.loop;
		}
		var muted = true;
		if (muted.loop && (muted.loop === true || muted.loop === false)) {
			muted = muted.loop;
		}
		var classes = '';
		if (extraData.classes) {
			classes = extraData.classes;
		}

		var newBlockquote = `<figure class="kg-card kg-embed-card kg-video-card ${classes ? classes : ''} ${extraData.caption && extraData.caption !== '' ? "kg-card-hascaption" : ''}">
				<div class="kg-video" style="${style}">
					<video ${autoplay ? "autoplay" : ''} ${muted ? "muted" : ''} ${loop ? "loop" : ''}>
						${source}
					</video>
				</div>
				${extraData.caption && extraData.caption !== '' ? generateFigureCaption(extraData.caption) : ''}
			</figure>`;
		
		$(this).replaceWith(newBlockquote);
	}
	function videoSource (filePath, fileType) {
		return `<source src="${filePath}" type="${videoMimeTypes[fileType]}">`; 
	}
	/**
	 * Create image card
	 */
	 function createImageCard() {
		var href = $(this)[0].href;
		if ($(this).parent().is('p')) {
			$(this).unwrap();
		}
		var extraData = parseExtraData($(this)[0].nextSibling);
		var fileType = getFileType(href);

		
		var altFileTypes = [];
		if (extraData.alternativeFileTypes && extraData.alternativeFileTypes.length) {
			altFileTypes = extraData.alternativeFileTypes;
		}

		if (!altFileTypes.includes(fileType)) {
			altFileTypes.push(fileType);
		}
		var type = 'normal';
		if (extraData.classes) {
			if (extraData.contains('kg-width-half')) {
				type = 'half';
			} else if (extraData.contains('kg-width-full')) {
				type = 'full';
			}
		}
		

		var caption = extraData.caption ? extraData.caption : '';
		var newBlockquote = `<figure class="kg-card kg-image-card ${extraData.classes ? extraData.classes : ''} ${caption !== '' ? "kg-card-hascaption" : ''}">
				${generatePictureElement(href, altFileTypes, caption, type)}
				${caption !== '' ? generateFigureCaption(caption) : ''}
			</figure>`;
		console.log(newBlockquote);
		$(this).replaceWith(newBlockquote);
	}

	function generatePictureElement (href, extraFormats, alt, type) {
		var isOnsite = linkIsOnsite(href);
		var fileType = getFileType(href);
		var source = '';
		var img = '';
		var srcset = '';

		if (isOnsite) {
			srcset = generateSrcSet(href, type);
			for (var format in extraFormats) {
				if (imageMimeTypes[extraFormats[format]] && !fallbackImageType.includes(extraFormats[format])) {
					var newSrcset = srcset.replaceAll(fileType, extraFormats[format]);					
					source += pictureSource(newSrcset, extraFormats[format], imageSizeAttribute[type]);	
				} else if (fallbackImageType.includes(extraFormats[format])) {
					var newHref = href.replace(fileType, extraFormats[format]);

					if (extraFormats[format] === 'svg') {
						img = generateImgElement(newHref, '', alt, type);
					} else {
						var newSrcset = srcset.replaceAll(fileType, extraFormats[format]);	
						img = generateImgElement(newHref, newSrcset, alt, type);
					}
					
				}			
			}
		}

		return `<picture>
			${source}
			${img}
		</picture>`;
	}

	function pictureSource (srcset, fileType, media) {
		return `<source class="kg-image" srcset="${srcset}" media="${media}" loading="lazy" type="${imageMimeTypes[fileType]}">`; 
	}

	function generateImgElement (href, srcset, alt, type) {
		if (linkIsOnsite(href)) {
			href = createSubLink(href, '');
		}
		var sizes = type && imageSizeAttribute[type] !== undefined ? imageSizeAttribute[type] : '';
		return `<img class="kg-image" src="${href}" loading="lazy" srcset="${srcset}" sizes="${sizes}" alt="${alt && alt !== '' ? alt : ''}" data-link="${href}">`;
	}

	function generateSrcSet(href, type) {
		var srcset = '';
		for (var size in imageMediaCalls[type]) {
			srcset += createSubLink(href, imageMediaCalls[type][size]) + ` ${imageMediaCalls[type][size]}w,`;
		};
		srcset = srcset.replace(/,$/g, '');
		return srcset;
	}

	function createSubLink (href, size) {
		if (size && size.match(/^\d+$/g)) {
			size = `/w${size}/`;
		} else {
			size = '';
		}
		if (href.match(/\/w\d+\//g)) {
			if (size === '') {
				href = href.replace(/\/images\/size\/w\d+\//g, '/images/');
			} else {
				href = href.replace(/\/w\d+\//g, size);
			}
		} else {
			href = href.replace('/images/','/images/size' + size);
		}
		return href;
	}
	/** 
	 * Instagram specific setup methods 
	 * */
	function disableInstagram() {
		$(this)[0].setAttribute('data-src', $(this)[0].getAttribute('data-instgrm-permalink'));
		$(this)[0].setAttribute('data-instgrm-permalink', '');
		$(this).before(generateEmbedConsentText('Instagram', unembedInstagramLink($(this)[0].getAttribute('data-instgrm-permalink')), "/datenschutzerklarung/"));
	}
	
	function createInstagramEmbedFromLink() {
		var href = $(this)[0].href;
		if ($(this).parent().is('p')) {
			$(this).unwrap();
		}

		var extraData = parseExtraData($(this)[0].nextSibling);
		var caption = extraData.caption ? extraData.caption : '';
		var classes = extraData.classes ? extraData.classes : '';

		var newBlockquote = `<figure class="kg-card kg-embed-card kg-instagram ${classes} ${caption !== '' ? "kg-card-hascaption" : ''}">
				<blockquote class="instagram-media"
					data-instgrm-permalink="${href}?utm_source=ig_embed&amp;utm_campaign=loading"
					data-instgrm-version="13">
				</blockquote>
				${caption !== '' ? generateFigureCaption(caption) : ''}
			</figure>`;

		$(this).replaceWith(newBlockquote);
	}
	function updateInstagramLink() {
		if (!$(this).parent().is('figure')) {
			var next = $(this).next('script');
			$(this).add(next).wrapAll(generateEmbedFigure(''));
		}
	}
	function unembedInstagramLink(href) {
		if (href && href !== false) {
			var url = new URL(href);
			url.search = '';
			return url.href
		}
		return href;
	}
	/** Youtube specific setup methods */
	function enableYoutube() {
		if ($(this)[0].hasAttribute('data-src')) {
			$(this)[0].src = $(this)[0].getAttribute('data-src');
		}
	}
	//block external sources from loading -> setup for consent
	function disableYoutube () {
		$(this)[0].setAttribute('data-src', $(this)[0].src);
		$(this)[0].src = '';
		var consent = generateEmbedConsentText('Youtube', unembedYoutubeLink($(this)[0].getAttribute('data-src')), "/datenschutzerklarung/");
		if ($(this).parent().is('.kg-video')) {
			$(this).parent().before(consent);
		} else {
			$(this).before(consent);
		}
	}

	function updateYoutubeLink() {
		$(this)[0].src = generateNoCookieYoutubeLink($(this)[0].src);
		var caption = $(this)[0].getAttribute('data-figcaption');
		var captionClass = caption && caption !== '' ? "kg-card-hascaption" : '';

		if (!$(this).parent().is('figure')) {
			$(this).wrap(generateEmbedFigure($(this)[0].getAttribute('data-classes') + captionClass));
		}		
		$(this).parent().addClass('kg-video-card');
		if (!$(this).parent().is('kg-video')) {
			$(this).wrap('<div class="kg-video"</div>');
		}

		if (caption && caption !== '') {
			$(this).parent().append(generateFigureCaption(caption));
		}
	}
	
	function unembedYoutubeLink(href) {
		if (href && href !== false) {
			var url = new URL(href);
			url.host = 'www.youtube.com'		
			var id = url.pathname.replace("/embed/", '');
			url.pathname = "/watch";
			url.search = "";
			url.searchParams.set('v', id);

			return (url.href);
		}
		return href;
	}
	function createYoutubeEmbedFromLink() {
		var href = generateYoutubeEmbedLink($(this)[0].href);
		if ($(this).parent().is('p')) {
			$(this).unwrap();
		}

		var extraData = parseExtraData($(this)[0].nextSibling);
		var caption = extraData.caption ? extraData.caption : '';
		var classes = extraData.classes ? extraData.classes : '';

		var newIFrame = `<iframe width="1920" height="1080" src="${href}" title="YouTube video player" frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
				allowfullscreen data-figcaption="${caption}" data-classes="${classes}">
			</iframe>`;
		$(this).replaceWith(newIFrame);

	}
	function generateYoutubeEmbedLink(href) {
		if (href === undefined || href == null) {
			return false;
		}
		var subpath = "/embed/";
		var url = new URL(href);
		if (!url.pathname.match(subpath)) {
			url.pathname = subpath + url.searchParams.get('v');
			url.searchParams.delete('v');
		}
		return url.href;
	}
	function generateNoCookieYoutubeLink(src) {
		if (src === undefined || src == null) {
			return false;
		}

		var noCookieHost = "www.youtube-nocookie.com";
		
		var url = new URL(src);
		if (url.host !== noCookieHost) {
			url.host = noCookieHost;
		}
		return url.href;
	}


	/**
	 * Consent toggle
	 */
	var consentButtons = $('.kg-consent-option button').each(function() {
		toggleConsent($(this), false);
		$(this).on('click', toggleConsentListener);
	});

	function toggleConsentListener() {
		toggleConsent($(this), true);
	}
	function toggleConsent(button, isEvent) {
		var service = button[0].getAttribute('data-service');
		var serviceText = service.charAt(0).toUpperCase() + service.slice(1);
		
		var cookie = getCookie(service + "-allowed");
		console.log(isEvent, button.text(), serviceText);
		if (cookie) {
			button.html(`${serviceText} deaktivieren`);
			isEvent ? setCookie(`${service}-allowed`, 0, -1) : '';
		} else {
			button.html(`${serviceText} aktivieren`);
			isEvent ? setCookie(`${service}-allowed`, cookieValue, cookieDaysAlive) : '';
		}
		//rest webpage
		isEvent ? location.reload(true) : '';
	}


	//auto image resolution
	var images = $('img');
	for (i = 0; i < images.length; i++) {
		images[i].setAttribute('data-link', images[i].src);
	}
	//make figure images clickable
	$('body').on('click','img', function() {
		if (this.parentNode.tagName === 'FIGURE' || this.parentNode.classList.contains('kg-gallery-image')) {
			window.open(this.getAttribute('data-link'));
		}
	})

	/**
	 * Viewport width without scrollbar varaible for css
	 */
	let scroller = document.scrollingElement;

	// Force scrollbars to display
	scroller.style.setProperty('overflow', 'scroll');

	function updateScrollbarCSS() {
		// Wait for next from so scrollbars appear
		requestAnimationFrame(()=>{
	
			// True width of the viewport, minus scrollbars
			scroller.style
				.setProperty(
				'--vw', 
				scroller.clientWidth / 100 + "px"
				);
			scroller.style
				.setProperty(
				'--viewport-width', 
				scroller.clientWidth + "px"
				);

			// Width of the scrollbar
			scroller.style
				.setProperty(
				'--scrollbar-width', 
				window.innerWidth - scroller.clientWidth + "px"
				);

			// Reset overflow
			scroller.style
				.setProperty(
				'overflow', 
				''
				);
		});
		return true;
	}
	$(window).on('resize', updateScrollbarCSS);
	updateScrollbarCSS();


    //quick fix for removed HTML entities in post headers
    var headlines = $(".major>h1,.major>h2,.major>p.content, article>header>h2");

    for (var i = 0; i < headlines.length; i++) {
    	headlines[i].innerHTML = headlines[i].innerHTML.replace(/&amp;shy;/g,"&shy;");
    }
})(jQuery);