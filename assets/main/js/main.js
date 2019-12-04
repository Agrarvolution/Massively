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
				$bg = $('<div class="bg"></div>').appendTo($t),
				on, off;

			on = function() {

				$bg
					.removeClass('fixed')
					.css('transform', 'matrix(1,0,0,1,0,0)');

				$window
					.on('scroll._parallax', function() {

						var pos = parseInt($window.scrollTop()) - parseInt($t.position().top);

						$bg.css('transform', 'matrix(1,0,0,1,0,' + (pos * intensity) + ')');

					});

			};

			off = function() {

				$bg
					.addClass('fixed')
					.css('transform', 'none');

				$window
					.off('scroll._parallax');

			};

			/*// Disable parallax on ..
				if (browser.name == 'ie'			// IE
				||	browser.name == 'edge'			// Edge
				||	window.devicePixelRatio > 1		// Retina/HiDPI (= poor performance)
				||	browser.mobile)					// Mobile devices*/
					off();

			// Enable everywhere else.
			/*
				else {

					breakpoints.on('>large', on);
					breakpoints.on('<=large', off);

				}*/
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
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'small', video.children('source')[0].src);
		}
	});
	breakpoints.on('>small', function() {
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'medium', video.children('source')[0].src);
		}
	});
	breakpoints.on('<=medium', function() {
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'medium', video.children('source')[0].src);
		}
	});
	breakpoints.on('>medium', function() {
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'large', video.children('source')[0].src);
		}
	});
	breakpoints.on('<=xlarge', function() {
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'large', video.children('source')[0].src);
		}
	});
	breakpoints.on('>xlarge', function() {
		for (i = 0; i < video.length; i++) {
			video.children('source')[0].src = replacemp4Link(videoSizes, 'xlarge', video.children('source')[0].src);
		}
	});

	function replacemp4Link (links, size, currentLink) {
		console.log(links[size] + currentLink.match(/[\d\w]+(\.mp4)$/gm));
		return links[size] + currentLink.match(/[\d\w]+(\.mp4)$/gm);
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
	}

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

	var imageLinks = [
		'/content/images/',
		'/content/images/size/w2000/',
		'/content/images/size/w1000/',
		'/content/images/size/w600/'
	];
	replaceImage($('figure').children('img'), imageLinks, 2);
	replaceImage($('div.kg-gallery-image').children('img'), imageLinks, 3);
	breakpoints.on('<=medium', function() {
		replaceImage($('a').children('img'), imageLinks, 2);
		replaceImage($('div.kg-gallery-image').children('img'), imageLinks, 2);
	});
	breakpoints.on('<=small', function () {
		replaceImage($('a').children('img'), imageLinks, 3);
		replaceImage($('figure').children('img'), imageLinks, 3);
		replaceImage($('div.kg-gallery-image').children('img'), imageLinks, 3);
	});
	breakpoints.on('>small', function () {
		replaceImage($('a').children('img'), imageLinks, 2);
		replaceImage($('figure').children('img'), imageLinks, 2);
		replaceImage($('div.kg-gallery-image').children('img'), imageLinks, 2);
	});
	breakpoints.on('>medium', function() {
		replaceImage($('a').children('img'), imageLinks, 1);
		replaceImage($('div.kg-gallery-image').children('img'), imageLinks, 3);
	});

	function replaceImage(currentImages, imageLinks, size) {
		for (var i=0; i < currentImages.length; i++) {
			currentImages[i].src = replaceImageLink(imageLinks[size], currentImages[i].src);
		}	
	}

	function replaceImageLink (newPath, currentLink) {
		var regex = /(\d+\/\d+\/)([\d\w\-_+\s]+)(\.[A-Za-z]+)$/g;
		var imageData = regex.exec(currentLink);
		console.log(newPath + imageData[0]);
		return newPath + imageData[0];
	}
	//make figure images clickable
	$('body').on('click','img', function() {
		if (this.parentNode.tagName === 'FIGURE' || this.parentNode.classList.contains('kg-gallery-image')) {
			window.open(this.getAttribute('data-link'));
		}
	})


})(jQuery);