'use strict';
/*
	Massively by HTML5 UP
	html5up.net | @ajlkn | Modified by @agrarvolution
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(() => {
	const Nav = document.querySelector('#nav');
	const NavPanelToggle = document.querySelector('#navPanelToggle');
	const NavContent = document.querySelectorAll('#nav > *');
	const Body = document.querySelector('body');
	const NavPanel = document.querySelector('#navPanel > nav');

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

	// Nav Panel switch between portrait and landscape
	breakpoints.on('>medium', function () {

		// NavPanel -> Nav.
		Nav.replaceChildren(...NavContent);

		// Flip icon classes.
		Nav.querySelectorAll('.icons, .icon').forEach(node => {
			node.classList.remove('alt');
		});
	});

	breakpoints.on('<=medium', function () {

		// Nav -> NavPanel.
		NavPanel.replaceChildren(...NavContent);

		// Flip icon classes.
		NavPanel.querySelectorAll('.icons, .icon').forEach(node => {
			node.classList.add('alt');
		})
	});

	NavPanelToggle.addEventListener('click', event => {
		Body.classList.add('is-navPanel-visible');
		Body.addEventListener('click', closeOnOutSideTap);
		return false;
	});

	document.querySelector('#navPanel a.close').addEventListener('click', event => {
		Body.classList.remove('is-navPanel-visible');
		return true;
	});
	function closeOnOutSideTap (event) {
		if (event.target.id !== "navPanelToggle" && event.target.closest('#navPanel') === null) {
			Body.classList.remove('is-navPanel-visible');
			Body.removeEventListener('click', closeOnOutSideTap);
			return false;
		}
		return true;
	}

	scrollObservers();

	function scrollObservers() {
		if (!(
			"IntersectionObserver" in window &&
			"IntersectionObserverEntry" in window &&
			"intersectionRatio" in window.IntersectionObserverEntry.prototype
		)) {
			return console.warn('Browser does not support IntersectionObserver.');
		}

		const ScrollTimeout = 500; //ms
		const Intro = document.querySelector('#intro');

		const LogoImage = document.querySelector('#header img')
		altMenuObserver();
		fadeInObserver();


		function altMenuObserver() {
			if (!LogoImage) {
				return false;
			}
			let menuObserver = new IntersectionObserver(entries => {
				console.log(entries[0]);
				if (entries[0].isIntersecting) {
					Nav.classList.remove('alt');
					NavPanelToggle.classList.remove('alt');
				} else {
					Nav.classList.add('alt');
					NavPanelToggle.classList.add('alt');
				}
			}, {
				rootMargin: '0px',
				threshold: 0
			});
			menuObserver.observe(LogoImage);
		}

		function fadeInObserver() {
			if (!Intro) {
				return false;
			}
			let previousY = 0, previousTime = 0;
			let introObserver = new IntersectionObserver(entries => {
				if (entries[0].boundingClientRect.y >= 0) {
					return false;
				}
				if ((entries[0].time - previousTime) < ScrollTimeout && Math.floor((previousY - entries[0].boundingClientRect.y) / 20) === 0) {
					previousTime = entries[0].time;
					return false;
				}

				if (entries[0].isIntersecting) {
					Intro.classList.remove('hidden');
				} else {
					Intro.classList.add('hidden');
				}
				previousY = entries[0].boundingClientRect.y;
				previousTime = entries[0].time;

			}, {
				rootMargin: '0px',
				threshold: 0.5
			});
			introObserver.observe(Intro);
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



	/** Clickable images helper methods */
	function isLinkOnsite(href) {
		if (href === undefined || href == null || href === '') {
			return false;
		}

		const fileLink = href.match(/^\/.+/g);
		if (fileLink) {
			return true;
		}

		try {
			var url = new URL(href);
			if (location.host === url.host) {
				return true;
			}
		}
		catch (e) {
			console.log(e)
		}

		return false;
	}
	function createSubLink(href, size) {
		if (size && size.match(/^\d+$/g)) {
			size = `/w${size}/`;
		} else {
			size = '';
		}

		return replaceFolder(href, size);

		function replaceFolder (href, size) {
			const HasFolder = href.match(/\/w\d+\//g);
			if (HasFolder && size === '') {
				return href.replace(/\/images\/size\/w\d+\//g, '/images/');
			}
			if (HasFolder) {
				href.replace(/\/w\d+\//g, size);
			}
			return href.replace('/images/', '/images/size' + size);
		}
	}

	const Images = document.querySelectorAll('img');
	for (let i = 0; i < Images.length; i++) {
		let fullSrc = Images[i].src;
		if (isLinkOnsite(fullSrc)) {
			fullSrc = createSubLink(Images[i].src, '');
		}
		if (Images[i].parentNode.tagName !== 'A') {
			Images[i].setAttribute('data-link', fullSrc);
		}
	}
	//make figure images clickable
	Body.addEventListener('click', (event) => {
		if (!event.target.hasAttribute('data-link')) {
			return true;
		}
		if (event.target.closest('.kg-image-card, .kg-gallery-card')) {
			window.open(event.target.getAttribute('data-link'));
		}
		return true;
	})

	/**
	 * Viewport width without scrollbar variable for css
	 */
	const scroller = document.scrollingElement;

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
	window.addEventListener('resize', updateScrollbarCSS);
	updateScrollbarCSS();

})();