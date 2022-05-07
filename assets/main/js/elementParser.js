(function () {
    /** 
     * Consent handling
     */

    const COOKIE_VALUE = 1;
    const COOKIE_DAYS_ALIVE = 365;
    const IS_EVENT = {
        yes: true,
        no: false
    };

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    document.querySelectorAll('.kg-consent-option button').each(function () {
        toggleConsent(this, IS_EVENT.no);
        this.addEventListener('click', toggleConsentListener);
    });

    function toggleConsentListener() {
        toggleConsent(this, IS_EVENT.yes);
    }

    function toggleConsent(button, isEvent) {
        const SERVICE = button[0].getAttribute('data-service');
        const SERVICE_TEXT = SERVICE.charAt(0).toUpperCase() + SERVICE.slice(1);

        const COOKIE = getCookie(SERVICE + "-allowed");
        if (COOKIE) {
            button.html(`${SERVICE_TEXT} deaktivieren`);
            isEvent ? setCookie(`${SERVICE}-allowed`, 0, -1) : '';
        } else {
            button.html(`${SERVICE_TEXT} aktivieren`);
            isEvent ? setCookie(`${SERVICE}-allowed`, COOKIE_VALUE, COOKIE_DAYS_ALIVE) : '';
        }
        //rest webpage
        isEvent ? location.reload(true) : '';
    }

    /**
     * Generate consent
     */
    //german for now
    function generateEmbedConsentText(service, link, gdprLink) {
        const LOWER_CASE_SERVICE = service.toLowerCase();
        return `<div class="kg-consent-container">
			<div class="kg-consent">
				<strong>${service}-DSGVO Auswahl</strong>
				<p>Diese Website verwendet ${service} um Inhalte zu ergänzen. Um Ihre Daten zu bestmöglich zu schützen ist die Anzeige standardmäßig deaktiviert.</p>
				<p>Beim Click auf den Anzeigen-Button stimmen Sie der <a href="${gdprLink}#${LOWER_CASE_SERVICE}-datenschutzerklaerung" target="_blank">Datenschutzerklärung</a> von ${service} zu, die Einstellung wird in einem Cookie gespeichert und seitenweit aktiviert. Die Einstellung kann in der <a href="${gdprLink}" target="_blank">Datenschutzerklärung</a> deaktiviert werden.</p>
				<span class="kg-consent-interface">
					<button class="consent-button" data-service="${LOWER_CASE_SERVICE}">Inhalte anzeigen</button>
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
            setCookie(`${service}-allowed`, COOKIE_VALUE, COOKIE_DAYS_ALIVE);
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


























    function getFileType(href) {
        try {
            if (href === undefined) {
                return false;
            }
            if (href === '') {
                return false;
            }

            const parsed = new URL(href);
            const match = parsed.pathname.match(/\.([\w]){1,}$/gi);

            if (match) {
                return match[0].replace('.', '').trim();
            }
            return '';

        }
        catch (e) {
            console.warn(e);
        }
    }

    function linkIsOnsite(href) {
        return isRelativLink(href) !== undefined;
    }
    function isRelativLink(href) {
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

    function parseExtraData(nextSibling) {
        if (nextSibling !== '' && nextSibling !== undefined && nextSibling != null
            && nextSibling.nodeName === "#text") {
            const parsed = JSON.parse(nextSibling.textContent);
            nextSibling.remove();
            return parsed;
        }
        return {};
    }

    let fallBackFormats = {};

    document.querySelectorAll('img.kg-image, .kg-gallery-image>img, .kg-partner-card img, .kg-bookmark-thumbnail img').filter(() => {
        return this.closest('figure:not(.kg-responsive)');
    }).each(function () {
        const fileType = getFileType(this.src);

        if (!linkIsOnsite(this.src) || fileType === 'svg') {
            return false;
        }

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

    });

    //get all free links
    var links = $('.content > p a:only-child');

    //disable link replacement on linktree
    var headline = document.querySelector('.major h1');
    if (headline != null && headline !== undefined && headline.textContent !== 'Linktree') {
        /* Setup unconverted Youtube-Links as iFrame */
        links.filter("[href*='https://www.youtube.com'], [href*='https://www.youtube-nocookie.com']")
            .each(createYoutubeEmbedFromLink);
        /*Setup unconverted Instagram-Link as Blockquote */
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


})();