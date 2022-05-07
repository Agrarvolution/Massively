'use strict';
/*
	Massively by HTML5 UP
	html5up.net | @ajlkn | Modified by @agrarvolution
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {

	var $window = $(window),
		$body = $('body'),
		$wrapper = $('#wrapper');
	const NAV = document.querySelector('#nav');
	const WRAPPER = document.querySelector('#wrapper');
	const NAV_PANEL_TOGGLE = document.querySelector('#navPanelToggle');
	const NAV_CONTENT = document.querySelectorAll('#nav > *');
	const BODY = document.querySelector('body');
	const NAV_PANEL = document.querySelector('#navPanel > nav');

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


	// Background.
	$wrapper._parallax(0.925);

	// Nav Panel switch between portrait and landscape
	breakpoints.on('>medium', function () {

		// NavPanel -> Nav.
		NAV.replaceChildren(...NAV_CONTENT);

		// Flip icon classes.
		NAV.querySelectorAll('.icons, .icon').forEach(node => {
			node.classList.remove('alt');
		});
	});

	breakpoints.on('<=medium', function () {

		// Nav -> NavPanel.
		NAV_PANEL.replaceChildren(...NAV_CONTENT);

		// Flip icon classes.
		NAV_PANEL.querySelectorAll('.icons, .icon').forEach(node => {
			node.classList.add('alt');
		})
	});

	NAV_PANEL_TOGGLE.addEventListener('click', event => {
		BODY.classList.add('is-navPanel-visible');
		return true;
	});
	document.querySelector('#navPanel a.close').addEventListener('click', event => {
		BODY.classList.remove('is-navPanel-visible');
		return true;
	})

	scrollObservers();

	function scrollObservers() {
		if (!(
			"IntersectionObserver" in window &&
			"IntersectionObserverEntry" in window &&
			"intersectionRatio" in window.IntersectionObserverEntry.prototype
		)) {
			return console.warn('Browser does not support IntersectionObserver.');
		}

		const SCROLL_TIMEOUT = 500; //ms
		const INTRO = document.querySelector('#intro');
		const MAIN = document.querySelector('#main');

		const LOGO_IMAGE = document.querySelector('#header img')
		altMenuObserver();
		fadeInObserver();


		function altMenuObserver() {
			if (!LOGO_IMAGE) {
				return false;
			}
			let menuObserver = new IntersectionObserver(entries => {
				console.log(entries[0]);
				if (entries[0].isIntersecting) {
					NAV.classList.remove('alt');
					NAV_PANEL_TOGGLE.classList.remove('alt');
				} else {
					NAV.classList.add('alt');
					NAV_PANEL_TOGGLE.classList.add('alt');
				}
			}, {
				rootMargin: '0px',
				threshold: 0
			});
			menuObserver.observe(LOGO_IMAGE);
		}

		function fadeInObserver() {
			if (!INTRO) {
				return false;
			}
			let previousY = 0, previousTime = 0;
			let introObserver = new IntersectionObserver(entries => {
				if (entries[0].boundingClientRect.y >= 0) {
					return false;
				}
				if ((entries[0].time - previousTime) < SCROLL_TIMEOUT && Math.floor((previousY - entries[0].boundingClientRect.y) / 20) === 0) {
					previousTime = entries[0].time;
					return false;
				}

				if (entries[0].isIntersecting) {
					INTRO.classList.remove('hidden');
				} else {
					INTRO.classList.add('hidden');
				}
				previousY = entries[0].boundingClientRect.y;
				previousTime = entries[0].time;

			}, {
				rootMargin: '0px',
				threshold: 0.5
			});
			introObserver.observe(INTRO);
		}
	}



	/**
	 * Enable spoiler text / hideable text
	 */
	const toggleHeadingElements = document.getElementsByClassName("kg-toggle-heading");

	const toggleFn = (event) => {
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
	 * Viewport width without scrollbar variable for css
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

})(jQuery);