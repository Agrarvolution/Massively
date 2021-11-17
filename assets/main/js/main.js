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
	/*
	if (getCookie('youtube-is-allowed') === null) {
		var consent = $('.videoConsent');
		consent.css('display', 'flex');
		
		$('.allowYT').click(function () {
			consent.css('display', 'none');
			enableYoutube()
			setCookie('youtube-is-allowed', 1, 30)
		});
		$('.disableYT').click(function() {
			consent.css('display', 'none');
		})
	}
	else 
	{
		enableYoutube();
	}*/

	//get all iframes
	var iframes = $('iframe');

	//get all youtube video iframes
	var youtube = iframes.filter("[src*='https://www.youtube.com'], [src*='https://www.youtube-nocookie.com']");

	function enableYoutube() {
		var youtubeVideos = $('iframe');
		for (i = 0; i < youtubeVideos.length; i++) {
			youtubeVideos[i].src = youtubeVideos[i].title
		}
		video.remove();
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

})(jQuery);