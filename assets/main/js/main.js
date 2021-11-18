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
		breakpoints({
			default:   ['1681px',   null       ],
			xlarge:    ['1281px',   '1680px'   ],
			large:     ['981px',    '1280px'   ],
			medium:    ['737px',    '980px'    ],
			small:     ['481px',    '736px'    ],
			xsmall:    ['361px',    '480px'    ],
			xxsmall:   [null,       '360px'    ]
		});

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
	var videoSizes = {'small': '/content/images/videos/360/',
					'medium': '/content/images/videos/480/',
					'large': '/content/images/videos/720/',
					'xlarge': '/content/images/videos/1080/'};
	var i = 0;
	breakpoints.on('<=small', function() {
		reloadVideosOnSizeUpdate('small');
	});

	breakpoints.on('<=medium', function() {
		reloadVideosOnSizeUpdate('medium');
	});

	breakpoints.on('<=xlarge', function() {
		reloadVideosOnSizeUpdate('large');
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

	function reloadVideosOnSizeUpdate (size) {
		for (i = 0; i < video.length; i++) {
			video[i].children[0].src = replacemp4Link(videoSizes, size, video[i].children[0].src);
			video[i].load();
		}
	}

	function replacemp4Link (links, size, currentLink) {
		return links[size] + currentLink.match(/[\d\w+-]+(\.mp4)$/gm);
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


	//get all iframes

	var links = $('.content > p a:only-child');
	/* Setup unconverted Youtube-Links as iFrame */
	var youtubeLinks = links.filter("[href*='https://www.youtube.com'], [href*='https://www.youtube-nocookie.com']")
		.each(createYoutubeEmbedFromLink);

	var youtubeCookie = 'youtube-allowed';


	var iframes = $('iframe');
	var instagram = $('.instagram-media + script');
	var instaScriptPath = '';

/*
	instagram.each(function() {
		instaScriptPath = $(this)[0].src;
		$(this)[0].removeAttribute('src');

		observer.observe($(this)[0].parentNode, {attributes: true, characterData: true, childList: true})
	});
	console.log(instagram);*/
	//get all youtube video iframes
	var youtube = iframes.filter("[src*='https://www.youtube.com'], [src*='https://www.youtube-nocookie.com']")
		.each(updateYoutubeLink);
	
	console.log(youtube, iframes);
	updateService('youtube');
		
	function parseExtraData(nextSibling) {
		if (nextSibling) {
			var textContent = nextSibling.textContent;

			var caption = textContent.match(/\[.+\]/gm);
			if (caption && caption.length) {
				caption = caption[0].replace(/[\[\]]/g, '').trim();
			} else {
				caption = '';
			}
			var classes = textContent.match(/{.+}/gm);
			if (classes && classes.length) {
				classes = classes[0].replace(/[{}]/g, '').trim();
			} else {
				classes = '';
			}
			var textContent = nextSibling.textContent = '';
			return {classes: classes, caption: caption};
		}

		return {classes: '', caption: ''};
	}



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
				<p>Diese Website verwendet ${service} um Medien einzubinden. Um Ihre Daten zu bestmöglich zu schützen ist die Anzeige standardmäßig deaktiviert.</p>
				<p>Beim Click auf den Anzeigen-Button stimmen Sie der <a href="${gdprLink}#${lowerCaseService}-datenschutzerklaerung" target="_blank">Datenschutzerklärung</a> von ${service} zu, die Einstellung wird in einem Cookie gespeichert und seitenweit aktiviert. Die Einstellung kann in der <a href="${gdprLink}" target="_blank">Datenschutzerklärung</a> deaktiviert werden.</p>
				<span class="kg-consent-interface">
					<button class="consent-button" data-service="${lowerCaseService}">Inhalte anzeigen</button>
					<a href="${link}" target="_blank"><button>${service} öffnen</button></a>
				</span>
			</div>
		</div>`;
	}
	

	function createConsentButtonListener(service) {
		$(".consent-button").on('click', consentGiven);
	}
	function consentGiven() {
		updateService($(this)[0].getAttribute('data-service'));
	}

	function updateService(service) {	
		if (getCookie(`${service}-allowed`)) {
			switch (service) {
				case 'youtube':
					youtube.each(enableYoutube);
					removeConsent(service);
					setCookie('youtube-allowed', cookieValue, cookieDaysAlive);
					break;
				default:
					break;
			}
		} else {
			switch (service) {
				case 'youtube':
					youtube.each(disableYoutube);
					createConsentButtonListener('youtube');
					break;
				default:
					break;
			}
		}
		

	}
	function removeConsent(service) {
		$(`[data-service="${service}"]`).parents('.kg-consent-container').remove();
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
		console.log($(this)[0]);
		$(this).before(generateEmbedConsentText('Youtube', unembedYoutubeLink($(this)[0].getAttribute('data-src')), "/datenschutzerklarung/"))
	}

	function updateYoutubeLink() {
		$(this)[0].src = generateNoCookieYoutubeLink($(this)[0].src);
		if (!$(this).parent().is('figure')) {
			$(this).wrap(generateEmbedFigure($(this)[0].getAttribute('data-classes')))
				.addClass('kg-video');
		}		
		$(this).parent().addClass('kg-video-card');

		var caption = $(this)[0].getAttribute('data-figcaption')
		if (caption) {
			$(this).parent().append(generateFigureCaption(caption));
		}
	}
	
	function unembedYoutubeLink(href) {
		if (href && href !== false) {
			console.log(href);
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
		console.log(href);
		if ($(this).parent().is('p')) {
			$(this).unwrap();
		}

		var extraData = parseExtraData($(this)[0].nextSibling);

		var newIFrame = `<iframe width="1920" height="1080" src="${href}" title="YouTube video player" frameborder="0" 
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
			allowfullscreen data-figcaption="${extraData.caption}" data-classes="${extraData.classes}">
		</iframe>`;
		$(this).replaceWith(newIFrame);

	}
	function generateYoutubeEmbedLink(href) {
		if (href === undefined || href == null) {
			return false;
		}
		var subpath = "/embed/";

		var url = new URL(href);
		console.log(url);
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