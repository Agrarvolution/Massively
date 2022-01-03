'use strict';
/*
	Massively by HTML5 UP
	html5up.net | @ajlkn | Modified by @agrarvolution
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper'),
		$header = $('#header'),
		$nav = $('#nav'),
		$main = $('#main'),
		$navPanelToggle, $navPanel, $navPanelInner;

	// Breakpoints.
	var breakPointSource = {
		default: ['2281px', null],
		xxlarge: ['1681px', '2280px'],
		xlarge: ['1281px', '1680px'],
		large: ['981px', '1280px'],
		medium: ['737px', '980px'],
		small: ['481px', '736px'],
		xsmall: ['361px', '480px'],
		xxsmall: [null, '360px']
	}
	breakpoints(breakPointSource);

	/**
	 * Applies parallax scrolling to an element's background image.
	 * @return {jQuery} jQuery object.
	 */
	$.fn._parallax = function (intensity) {
		var $window = $(window),
			$this = $(this);

		if (this.length == 0 || intensity === 0)
			return $this;

		if (this.length > 1) {

			for (var i = 0; i < this.length; i++)
				$(this[i])._parallax(intensity);

			return $this;

		}

		if (!intensity)
			intensity = 0.1;

		$this.each(function () {

			var $t = $(this),
				$bg = $('<div class="bg"></div>').appendTo($t), off;

			off = function () {

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
			.on('load._parallax resize._parallax', function () {
				$window.trigger('scroll');
			});

		return $(this);

	};

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
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
		enter: function () {
			$navPanelToggle.removeClass('alt');
			$nav.removeClass('alt')
		},
		leave: function () {
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

	breakpoints.on('>medium', function () {

		// NavPanel -> Nav.
		$navContent.appendTo($nav);

		// Flip icon classes.
		$nav.find('.icons, .icon')
			.removeClass('alt');

	});

	breakpoints.on('<=medium', function () {

		// Nav -> NavPanel.
		$navContent.appendTo($navPanelInner);

		// Flip icon classes.
		$navPanelInner.find('.icons, .icon')
			.addClass('alt');

	});

	// Hack: Disable transitions on WP.
	if (browser.os == 'wp'
		&& browser.osVersion < 10)
		$navPanel
			.css('transition', 'none');

	// Intro.
	var $intro = $('#intro');

	if ($intro.length > 0) {

		// Hack: Fix flex min-height on IE.
		if (browser.name == 'ie') {
			$window.on('resize.ie-intro-fix', function () {

				var h = $intro.height();

				if (h > $window.height())
					$intro.css('height', 'auto');
				else
					$intro.css('height', h);

			}).trigger('resize.ie-intro-fix');
		}

		// Hide intro on scroll (> small).
		breakpoints.on('>small', function () {

			$main.unscrollex();

			$main.scrollex({
				mode: 'bottom',
				top: '25vh',
				bottom: '-50vh',
				enter: function () {
					$intro.addClass('hidden');
				},
				leave: function () {
					$intro.removeClass('hidden');
				}
			});

		});

		// Hide intro on scroll (<= small).
		breakpoints.on('<=small', function () {

			$main.unscrollex();

			$main.scrollex({
				mode: 'middle',
				top: '15vh',
				bottom: '-15vh',
				enter: function () {
					$intro.addClass('hidden');
				},
				leave: function () {
					$intro.removeClass('hidden');
				}
			});

		});

	}

	const toggleHeadingElements = document.getElementsByClassName("kg-toggle-heading");

    const toggleFn = function(event) {
        const targetElement = event.target;
        const parentElement = targetElement.closest('.kg-toggle-card');
        var toggleState = parentElement.getAttribute("data-kg-toggle-state");
        if (toggleState === 'close') {
            parentElement.setAttribute('data-kg-toggle-state', 'open');
        } else {
            parentElement.setAttribute('data-kg-toggle-state', 'close');
        }
    };

    for (let i = 0; i < toggleHeadingElements.length; i++) {
        toggleHeadingElements[i].addEventListener('click', toggleFn, false);
    }

	if (document.querySelector('.kg-video-player-container') !== undefined ||
		document.querySelector('.kg-audio-card') !== undefined) {
			var script = $('script');
			script[0].src = `/assets/main/js/media.js?v=${getScriptId()}`;
			script[0].type = 'text/javascript';
			script[0].async = true;
			document.querySelector('body').appendChild(script[0]); 
	}
	
	function getScriptId () {
		var scripts = document.querySelectorAll('script');
		return new URL(scripts[scripts.length - 1].src).searchParams.get('v');
	}

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

	var cookieValue = 1;
	var cookieDaysAlive = 365;

	//video consent
	function setCookie(name, value, days) {
		var expires = "";
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "") + expires + "; path=/";
	}
	function getCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	function getFileType(href) {
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

	var fallBackFormats = {};

	var kgImage = $('img.kg-image, .kg-gallery-image>img, .kg-partner-card img, .kg-bookmark-thumbnail img').filter(() => {
		return $(this).parentsUntil('figure').is(":not(.kg-responsive)");
	}).each(function () {
		var fileType = getFileType(this.src);

		if (linkIsOnsite(this.src) && fileType !== 'svg') {
			var parent = $(this).parents('figure.kg-card');
			var type = 'normal';

			if (parent.is('.kg-width-full')) {
				type = 'full';
			} else if (parent.is('.kg-width-half')) {
				type = 'half';
			} else if (parent.is('.kg-gallery-card')) {
				type = 'gallery';
			} else if (parent.is('.kg-partner-card')) {
				type = 'partner';
			} else if (parent.is('.kg-bookmark-card')) {
				type = 'bookmark';
			}

			if (fallBackFormats[fileType]) {
				$(this).replaceWith(generatePictureElement(this.src, [fileType, fallBackFormats[fileType]], this.alt, type))
			} else {
				this.srcset = generateSrcSet(this.src, type);
				this.sizes = imageSizeAttribute[type];
			}
		}
	});

	//get all free links
	var links = $('.content > p a:only-child');
	/* Setup unconverted Youtube-Links as iFrame */
	links.filter("[href*='https://www.youtube.com'], [href*='https://www.youtube-nocookie.com']")
		.each(createYoutubeEmbedFromLink);
	/*Setup unconverted Instagram-Link as Blockquote */
	var headline = document.querySelector('.major h1');
	if (headline !== undefined && headline.textContent !== 'Linktree') {
		links.filter("[href*='https://www.instagram.com']").each(createInstagramEmbedFromLink);
	}
	


	var iframes = $('iframe');
	//get all youtube video iframes
	var youtube = iframes.filter("[src*='https://www.youtube.com'], [src*='https://www.youtube-nocookie.com']")
		.each(updateYoutubeLink);
	updateService('youtube', getCookie(`youtube-allowed`), false);
	//get all unactivated instagram embeds
	var instagram = $('blockquote.instagram-media').each(updateInstagramLink);
	updateService('instagram', getCookie(`instagram-allowed`), false);

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
		updateService(this.getAttribute('data-service'), true, true);
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
	 * Create image elements
	 */
	function generatePictureElement(href, extraFormats, alt, type) {
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

	function pictureSource(srcset, fileType, media) {
		return `<source class="kg-image" srcset="${srcset}" media="${media}" loading="lazy" type="${imageMimeTypes[fileType]}">`;
	}

	function generateImgElement(href, srcset, alt, type) {
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

	function createSubLink(href, size) {
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
		} else if (size !== '') {
			href = href.replace('/images/', '/images/size' + size);
		}
		return href;
	}
	/** 
	 * Instagram specific setup methods 
	 * */
	function disableInstagram() {
		this.setAttribute('data-src', this.getAttribute('data-instgrm-permalink'));
		this.setAttribute('data-instgrm-permalink', '');
		$(this).before(generateEmbedConsentText('Instagram', unembedInstagramLink(this.getAttribute('data-instgrm-permalink')), "/datenschutzerklarung/"));
	}

	function createInstagramEmbedFromLink() {
		var href = this.href;
		var $this = $(this);
		if ($this.parent().is('p')) {
			$this.unwrap();
		}

		var extraData = parseExtraData(this.nextSibling);
		var caption = extraData.caption ? extraData.caption : '';
		var classes = extraData.classes ? extraData.classes : '';

		var newBlockquote = `<figure class="kg-card kg-embed-card kg-instagram ${classes} ${caption !== '' ? "kg-card-hascaption" : ''}">
				<blockquote class="instagram-media"
					data-instgrm-permalink="${href}?utm_source=ig_embed&amp;utm_campaign=loading"
					data-instgrm-version="13">
				</blockquote>
				${caption !== '' ? generateFigureCaption(caption) : ''}
			</figure>`;

		$this.replaceWith(newBlockquote);
	}
	function updateInstagramLink() {
		var $this = $(this);
		if (!$this.parent().is('figure')) {
			var next = $this.next('script');
			$this.add(next).wrapAll(generateEmbedFigure(''));
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
		if (this.hasAttribute('data-src')) {
			this.src = this.getAttribute('data-src');
		}
	}
	//block external sources from loading -> setup for consent
	function disableYoutube() {
		this.setAttribute('data-src', this.src);
		this.src = '';
		var $this = $(this);

		var consent = generateEmbedConsentText('Youtube', unembedYoutubeLink(this.getAttribute('data-src')), "/datenschutzerklarung/");
		if ($this.parent().is('.kg-video')) {
			$this.parent().before(consent);
		} else {
			$this.before(consent);
		}
	}

	function updateYoutubeLink() {
		this.src = generateNoCookieYoutubeLink(this.src);
		var caption = this.getAttribute('data-figcaption');
		var captionClass = caption && caption !== '' ? "kg-card-hascaption" : '';
		var $this = $(this);

		if (!$this.parent().is('figure')) {
			$this.wrap(generateEmbedFigure(this.getAttribute('data-classes') + captionClass));
		}
		$this.parent().addClass('kg-video-card');
		if (!$this.parent().is('kg-video')) {
			$this.wrap('<div class="kg-video"</div>');
		}

		if (caption && caption !== '') {
			$this.parent().append(generateFigureCaption(caption));
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
		var href = generateYoutubeEmbedLink(this.href);
		var $this = $(this);
		if ($this.parent().is('p')) {
			$this.unwrap();
		}

		var extraData = parseExtraData(this.nextSibling);
		var caption = extraData.caption ? extraData.caption : '';
		var classes = extraData.classes ? extraData.classes : '';

		var newIFrame = `<iframe width="1920" height="1080" src="${href}" title="YouTube video player" frameborder="0" 
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
				allowfullscreen data-figcaption="${caption}" data-classes="${classes}">
			</iframe>`;
		$this.replaceWith(newIFrame);

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
	var consentButtons = $('.kg-consent-option button').each(function () {
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
		var fullSrc = images[i].src;
		if (linkIsOnsite(fullSrc)) {
			fullSrc = createSubLink(images[i].src, '');
		}
		if (images[i].parentNode.tagName !== 'A') {
			images[i].setAttribute('data-link', fullSrc);
		}
	}
	//make figure images clickable
	var lastSeen = {};
	$('body').on('click', 'img', function () {
		var $this = $(this);
		
		if (this.hasAttribute('data-link')) {
			if ($this.parents('.kg-gallery-container').is(':not(.kg-gallery-container--narrow)') || lastSeen === this) {
				console.log($this.is(':focus'), $this.parents('.kg-gallery-container').is(':not(.kg-gallery-container--narrow)'), $this.parents('.kg-gallery-container'));
				window.open(this.getAttribute('data-link'));
			} else if ($this.parents('.kg-gallery-container').is('.kg-gallery-container--narrow')) {
				lastSeen = this;
			}
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
		requestAnimationFrame(() => {

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
	var headlines = $(".major>h1,.major>h2,.major>p.content, article>header>h2, .main-content--headline");

	for (var i = 0; i < headlines.length; i++) {
		headlines[i].innerHTML = headlines[i].innerHTML.replace(/&amp;shy;/g, "&shy;");
	}
})(jQuery);