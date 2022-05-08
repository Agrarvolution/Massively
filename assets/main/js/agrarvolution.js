var agrarvolution = agrarvolution || {};

agrarvolution.consent = (() => {
    /** 
     * Consent handling
     */

    const COOKIE_VALUE = 1;
    const COOKIE_DAYS_ALIVE = 365;
    const IS_EVENT = {
        yes: true,
        no: false
    };

    const consentTemplate = document.querySelector('#consent-template');

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

    function setupConsentButtons () {
        [...document.querySelectorAll('.kg-consent-option button')].forEach(consentButton => {
            toggleConsent(consentButton, IS_EVENT.no);
            consentButton.addEventListener('click', toggleConsentListener);
        });
    }

    function toggleConsentListener(consentButton) {
        toggleConsent(consentButton.target, IS_EVENT.yes);
    }

    function toggleConsent(button, isEvent) {
        const SERVICE = button.getAttribute('data-service');
        const SERVICE_TEXT = SERVICE.charAt(0).toUpperCase() + SERVICE.slice(1);

        const COOKIE = getCookie(SERVICE + "-allowed");
        if (COOKIE) {
            button.textContent = `${SERVICE_TEXT} deaktivieren`;
            isEvent ? setCookie(`${SERVICE}-allowed`, 0, -1) : '';
        } else {
            button.textContent = `${SERVICE_TEXT} aktivieren`;
            isEvent ? setCookie(`${SERVICE}-allowed`, COOKIE_VALUE, COOKIE_DAYS_ALIVE) : '';
        }
        //rest webpage
        isEvent ? location.reload(true) : '';
    }

    /**
     * Generate consent
     */
    //german for now
    function generateEmbedConsentText(service, href, gdprLink) {
        const lowerCaseService = service.toLowerCase();
        const consentTemplateClone = consentTemplate.content.cloneNode(true);

        consentTemplateClone.querySelectorAll('span[data-service]').forEach(node => {
            node.replaceWith(service);
        });
        consentTemplateClone.querySelector('.kg-consent p a').href = `${gdprLink}#${lowerCaseService}-datenschutzerklaerung`;
        consentTemplateClone.querySelector('.kg-consent-interface a').href = href;
        consentTemplateClone.querySelector('.kg-consent-interface button').setAttribute('data-service', lowerCaseService);

        return consentTemplateClone;
    }

    function createConsentButtonListener(service) {
        document.querySelectorAll(`.consent-button[data-service="${service}"]`)
            .forEach(button => button.addEventListener('click', consentGiven));
    }

    function consentGiven(event) {
        agrarvolution.parseText.updateService(event.target.getAttribute('data-service'), true, true);
    }
    function removeConsent(service) {
        document.querySelectorAll(`[data-service="${service}"]`).forEach(consent => {
            const consentText = consent.closest('.kg-consent-container');
            if (consentText) {
                consentText.parentNode = null;
            }
        });
    }

    return {
        'generateEmbedConsentText': generateEmbedConsentText,
        'createConsentButtonListener': createConsentButtonListener,
        'removeConsent': removeConsent,
        'getCookie': getCookie,
        'setCookie': setCookie,
        'COOKIE_VALUE': COOKIE_VALUE,
        'COOKIE_DAYS_ALIVE': COOKIE_DAYS_ALIVE,
        'setupConsentButtons': setupConsentButtons
    }
})();

agrarvolution.videoHandling = (() => {
    let videos = [];
    const videoSizes = {
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
    function setupBreakpoints(breakpoints) {
        videos = document.querySelectorAll('video');

        breakpoints.on('<=xsmall', function () {
            updateVideoSize('xsmall');
        });
        breakpoints.on('<=small', function () {
            updateVideoSize('small');
        });
        breakpoints.on('<=medium', function () {
            updateVideoSize('medium');
        });
        breakpoints.on('<=xlarge', function () {
            updateVideoSize('large');
        });

        breakpoints.on('>xsmall', function () {
            updateVideoSize('small');
        });
        breakpoints.on('>small', function () {
            updateVideoSize('medium');
        });
        breakpoints.on('>medium', function () {
            updateVideoSize('large');
        });
        breakpoints.on('>xlarge', function () {
            updateVideoSize('xlarge');
        });
    }

    function updateVideoSize(size) {
        for (var i = 0; i < videos.length; i++) {
            reloadVideoandUpdateSize(videos[i], size);

        }
    }
    function reloadVideoandUpdateSize(video, size) {
        if (video == null || !(video.src === '')) {
            return false;
        }
        if (!agrarvolution.util.isLinkOnsite(video.children[0].src)) {
            return false;
        }
        let layoutType = 'normal';
        if (video.closest('kg-width-half')) {
            layoutType = 'half'
        }
        video.children[0].src = replaceLink(videoSizes[layoutType], size, videos[i].children[0].src);
        video.load();
    }


    function replaceLink(links, size, currentLink) {
        let path = currentLink.match(/[\d\w+-.]+$/g);
        if (path !== undefined && path != null) {
            return links[size] + path[0];
        }
        return currentLink;
    }

    return {
        'setupBreakpoints': setupBreakpoints
    }
})();

agrarvolution.util = (() => {
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

    return {
        'getFileType': getFileType,
        'isLinkOnsite': isLinkOnsite
    }
})();



agrarvolution.parseText = (() => {
    const imageMimeTypes = {
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
    const fallbackImageType = [
        'svg', 'jpeg', 'jpg', 'png', 'gif'
    ];

    const defaultImageLink = '/content/images/size/';
    const imageMediaCalls = {
        'normal': ['300', '400', '500', '600', '700', '800', '1000', '1200', '1500'],
        'half': ['300', '400', '500', '600', '700'],
        'gallery': ['200', '300', '400', '500', '600'],
        'bookmark': ['300', '400', '500', '600'],
        'full': ['400', '500', '600', '700', '800', '900', '1000', '1150', '1500', '2000'],
        'partner': ['200', '300', '400'],
    };
    const imageSizeAttribute = {
        'normal': '(min-width: 2281px) 1500px, (min-width: 1681px) 1200px, (min-width: 900px) 720px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'half': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'gallery': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'bookmark': '(min-width: 2281px) 600px, (min-width: 1681px) 480px, (min-width: 737px) 300px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'full': '(min-width: 2281px) 2000px, (min-width: 1681px) 1536px, (min-width: 1281px) 1152px, (min-width: 981px) 1056px, (min-width: 481px) 70vw, 100vw',
        'partner': '(min-width: 1681px) 300px, (min-width: 737px) 200px, (min-width: 567px) 35vw, 200px'
    }
    const instagramTemplate = document.querySelector('#instagram-template-card');
    const youtubeIFrameTemplate = document.querySelector('#youtube-iframe-template');
    const youtubeNoCookieHost = "www.youtube-nocookie.com";
    const youtubeSubpath = "/embed/";
    const body = document.querySelector('body');
    const instagramScriptTemplate = document.querySelector('#instagram-script');
    let youtubeNodes = [], instagramNodes = [];
    let fallBackFormats = {};

    //Create responsive links for all images
    [...document.querySelectorAll('img.kg-image, .kg-gallery-image>img, .kg-partner-card img, .kg-bookmark-thumbnail img')]
        .filter(image => {
            if (image.closest('figure:not(.kg-responsive)')) {
                return true;
            }
            return false;
        }).forEach(image => {
            const fileType = agrarvolution.util.getFileType(image.src);

            if (!agrarvolution.util.isLinkOnsite(image.src) || fileType === 'svg') {
                return false;
            }

            const parent = image.closest('figure.kg-card');
            let type = 'normal';

            if (parent.classList.contains('.kg-width-full')) {
                type = 'full';
            } else if (parent.classList.contains('.kg-width-half')) {
                type = 'half';
            } else if (parent.classList.contains('.kg-gallery-card')) {
                type = 'gallery';
            } else if (parent.classList.contains('.kg-partner-card')) {
                type = 'partner';
            } else if (parent.classList.contains('.kg-bookmark-card')) {
                type = 'bookmark';
            }

            if (fallBackFormats[fileType]) {
                image.parentNode.replaceChild(generatePictureElement(image.src, [fileType, fallBackFormats[fileType]], image.alt, type), image);
            } else {
                image.srcset = generateSrcSet(image.src, type);
                image.sizes = imageSizeAttribute[type];
            }

        });


    //Generator methods

    /**
     * Common generation functions 
     */
    function generateEmbedFigure(extraClasses) {
        const figure = document.createElement('figure');
        figure.classList.add('kg-card', 'kg-embed-card', ...extraClasses.trim().split(' '));
        return figure;
    }
    function generateFigureCaption(caption) {
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = caption;
        return figcaption;
    }

    /**
     * Create image elements
     */
    function generatePictureElement(href, extraFormats, alt, type) {
        const fileType = agrarvolution.util.getFileType(href);
        const picture = document.createElement('picture');

        let source = [], img = '', srcset = '';

        if (!agrarvolution.util.isLinkOnsite(href)) {
            return false;
        }

        srcset = generateSrcSet(href, type);
        for (let format in extraFormats) {
            generateFormats(extraFormats[format]);
        }

        picture.replaceWith(...source);
        picture.appendChild(img);

        return picture;

        function generateFormats(format) {
            if (imageMimeTypes[format] && !fallbackImageType.includes(format)) {
                var newSrcset = srcset.replaceAll(fileType, format);
                source.push(pictureSource(newSrcset, format, imageSizeAttribute[type]));
                return true;
            }
            if (!fallbackImageType.includes(format)) {
                return false;
            }

            let newHref = href.replace(fileType, format);

            if (format === 'svg') {
                img = generateImgElement(newHref, '', alt, type);
            } else {
                let newSrcset = srcset.replaceAll(fileType, format);
                img = generateImgElement(newHref, newSrcset, alt, type);
            }

        }
    }


    function pictureSource(srcset, fileType, media) {
        const sourceClone = document.createElement('source');

        sourceClone.loading = 'lazy';
        sourceClone.classList.add('kg-image');
        sourceClone.srcset = srcset;
        sourceClone.media = media;
        sourceClone.type = imageMimeTypes[fileType];

        return sourceClone;
    }

    function generateImgElement(href, srcset, alt, type) {
        const img = document.createElement('img');

        if (agrarvolution.util.isLinkOnsite(href)) {
            href = createSubLink(href, '');
        }
        let sizes = type && imageSizeAttribute[type] !== undefined ? imageSizeAttribute[type] : '';

        img.loading = 'lazy';
        img.src = href;
        img.srcset = srcset;
        img.sizes = sizes;
        img.alt = alt ? alt : '';
        img.setAttribute('data-link', href);

        return img;
    }

    /**
     * Service embeds
     */
    function createInstagramEmbedFromLink(link) {
        console.log(link.nextSibling);
        const extraData = parseExtraData(link.nextSibling);
        let instagramCard = instagramTemplate.content.cloneNode(true);

        link.parentNode.prepend(instagramCard);
        instagramCard = link.parentNode.querySelector('.kg-instagram');

        if (link.parentNode.tagName === 'P') {
            link.parentNode.replaceWith(instagramCard);
        }

        instagramCard.querySelector('blockquote').setAttribute('data-instgrm-permalink', `${link.href}?utm_source=ig_embed&amp;utm_campaign=loading`);

        instagramCard.classList.add(...(extraData.classes || []));
        if (extraData.caption) {
            instagramCard.classList.add('kg-card-hascaption');
            instagramCard.appendChild(generateFigureCaption(extraData.caption));
        }


    }

    function createYoutubeEmbedFromLink(link) {
        const extraData = parseExtraData(link.nextSibling);
        let youtubeFrame = youtubeIFrameTemplate.content.cloneNode(true);

        link.parentNode.prepend(youtubeFrame);
        youtubeFrame = link.parentNode.querySelector('iframe');

        if (link.parentNode.tagName === 'P') {
            link.parentNode.replaceWith(youtubeFrame);
        }


        youtubeFrame.src = generateYoutubeEmbedLink(link.href);
        youtubeFrame.setAttribute('data-figcaption', extraData.caption);
        youtubeFrame.setAttribute('data-classes', extraData.classes);
    }

    // Youtube util methods
    function updateYoutubeLink(iFrame) {
        iFrame.src = generateNoCookieYoutubeLink(iFrame.src);
        const captionText = iFrame.getAttribute('data-figcaption');
        const captionClass = captionText !== '' ? "kg-card-hascaption" : '';
        const figureParent = iFrame.closest('figure.kg-card');
        const classes = iFrame.getAttribute('data-classes') || '' + ' ' + captionClass + " test";

        if (figureParent) {   
            figureParent.classList.add(...classes.trim().split(' '));
        } else {
            const figure = generateEmbedFigure(classes.trim());
            iFrame.parentNode.insertBefore(figure, iFrame);
            figure.appendChild(iFrame);
        }

        iFrame.parentNode.classList.add('kg-video-card');

        if (!iFrame.parentNode.classList.contains('kg-video')) {
            const kgVideo = document.createElement('div');
            kgVideo.classList.add('kg-video');
            iFrame.parentNode.appendChild(kgVideo);
            kgVideo.appendChild(iFrame);
        }

        if (captionText !== '') {
            iFrame.closest('.kg-video-card').appendChild(generateFigureCaption(captionText));
        }
    }

    function generateYoutubeEmbedLink(href) {
        if (href === undefined || href == null) {
            return false;
        }

        const url = new URL(href);

        if (!url.pathname.match(youtubeSubpath)) {
            url.pathname = youtubeSubpath + url.searchParams.get('v');
            url.searchParams.delete('v');
        }
        return url.href;
    }
    function generateNoCookieYoutubeLink(src) {
        if (src === undefined || src == null) {
            return false;
        }
        const url = new URL(src);
        if (url.host !== youtubeNoCookieHost) {
            url.host = youtubeNoCookieHost;
        }
        return url.href;
    }

    /**
     * Setup methods
     */
    //Instagram
    function disableInstagram(instagram) {
        instagram.setAttribute('data-src', instagram.getAttribute('data-instgrm-permalink'));
        instagram.setAttribute('data-instgrm-permalink', '');
        instagram.parentNode.prepend(agrarvolution.consent
            .generateEmbedConsentText('Instagram', unembedInstagramLink(instagram.getAttribute('data-instgrm-permalink')), "/datenschutzerklarung/"));
    }

    function updateInstagramLink(instagram) {
        if (!instagram.parentNode.tagName === 'figure') {
            const embed = generateEmbedFigure('');
            const next = instgram.next('script');
            instagram.parentNode.insertBefore(embed);
            embed.appendChild(instagram);
            embed.appendChild(next);
        }
    }
    function unembedInstagramLink(href) {
        if (href && href !== false) {
            const url = new URL(href);
            url.search = '';
            return url.href
        }
        return href;
    }

    //Youtube
    /** Youtube specific setup methods */
    function enableYoutube(iFrame) {
        if (iFrame.hasAttribute('data-src')) {
            iFrame.src = iFrame.getAttribute('data-src');
        }
    }
    //block external sources from loading -> setup for consent
    function disableYoutube(iFrame) {
        iFrame.setAttribute('data-src', iFrame.src);
        iFrame.src = '';

        const consent = agrarvolution.consent.generateEmbedConsentText('Youtube', unembedYoutubeLink(iFrame.getAttribute('data-src')), "/datenschutzerklarung/");
        if (iFrame.parentNode.classList.contains('.kg-video')) {
            iFrame.parentNode.parentNode.prepend(consent);
        } else {
            iFrame.parentNode.prepend(consent);
        }
    }

    function unembedYoutubeLink(href) {
        if (href && href !== false) {
            const url = new URL(href);
            url.host = 'www.youtube.com'
            const id = url.pathname.replace("/embed/", '');
            url.pathname = "/watch";
            url.search = "";
            url.searchParams.set('v', id);

            return (url.href);
        }
        return href;
    }

    //Util methods

    function parseExtraData(nextSibling) {
        if (nextSibling !== '' && nextSibling !== undefined && nextSibling != null
            && nextSibling.nodeName === "#text") {
            const parsed = JSON.parse(nextSibling.textContent);
            nextSibling.remove();
            return parsed;
        }
        return {};
    }

    function generateSrcSet(href, type) {
        let srcset = '';
        for (let size in imageMediaCalls[type]) {
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

        return replaceFolder(href, size);

        function replaceFolder(href, size) {
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

    //GDPR consent
    function updateService(service, active, isEvent) {
        if (active) {
            switch (service) {
                case 'youtube':
                    youtubeNodes.forEach(iFrame => enableYoutube(iFrame));
                    break;
                case 'instagram':
                    body.appendChild(instagramScriptTemplate);
                    if (isEvent) {
                        location.reload(true);
                    }
                    break;
                default:
                    break;
            }
            agrarvolution.consent.removeConsent(service);
            agrarvolution.consent.setCookie(`${service}-allowed`, agrarvolution.consent.COOKIE_VALUE, agrarvolution.consent.COOKIE_DAYS_ALIVE);
        } else {
            switch (service) {
                case 'youtube':
                    youtubeNodes.forEach(iFrame => disableYoutube(iFrame));
                    break;
                case 'instagram':
                    document.querySelectorAll('.instagram-media + script, script.instagram').forEach(node => node.remove());
                    instagramNodes.forEach(node => disableInstagram(node));
                    break;
                default:
                    break;
            }
            agrarvolution.consent.createConsentButtonListener(service);
        }


    }

    function parseLinks() {
        const links = [...document.querySelectorAll('.content > p > a:first-child')].filter(
            node => {
                if (node.previousSibling) {
                    return false;
                }
                return true;
            }
        );
        const iframes = document.querySelectorAll('iframe');

        //disable link replacement on linktree
        const headline = document.querySelector('.major h1');
        if (headline != null && headline !== undefined && headline.textContent.toLowerCase() !== 'linktree') {
            /* Setup unconverted Youtube-Links as iFrame */
            links.filter(link => {
                const url = new URL(link.href);
                if (url.hostname === 'www.youtube.com' || url.hostname === 'www.youtube-nocookie.com') {
                    return true;
                }
                return false;
            }).forEach(link => createYoutubeEmbedFromLink(link));
            /*Setup unconverted Instagram-Link as Blockquote */
            links.filter(link => {
                const url = new URL(link.href);
                if (url.hostname === 'www.instagram.com') {
                    return true;
                }
                return false;
            }).forEach(link => createInstagramEmbedFromLink(link));
        }

        //get all youtube video iframes
        youtubeNodes = [...iframes].filter(iFrame => {
            const url = new URL(iFrame.src);
            if (url.hostname === 'www.youtube.com' || url.hostname === 'www.youtube-nocookie.com') {
                return true;
            }
            return false;
        })
        youtubeNodes.forEach(iFrame => updateYoutubeLink(iFrame));

        updateService('youtube', agrarvolution.consent.getCookie(`youtube-allowed`), false);

        //get all unactivated instagram embeds
        instagramNodes = [...document.querySelectorAll('blockquote.instagram-media')];
        instagramNodes.forEach(node => updateInstagramLink(node));
        updateService('instagram', agrarvolution.consent.getCookie(`instagram-allowed`), false);
    }

    return {
        parseLinks: parseLinks,
        updateService: updateService
    }
})();

agrarvolution.consent.setupConsentButtons();
agrarvolution.parseText.parseLinks();
agrarvolution.videoHandling.setupBreakpoints(breakpoints);