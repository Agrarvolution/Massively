'use strict';

var ghostEmbedGenerator = () => {
    const htmlSnippetTypes = ['image', 'gallery', 'gallery-narrow', 'gallery-flowing', 'bookmark', 'video'];
    const objectFitCSS = ['fill', 'contain', 'cover', 'none', 'scale-down', 'inherit', 'initial', 'revert', 'unset'];
    const preloadHTML = ['auto', 'metadata', 'none'];
    const formElementID = {
        snippet: 0,
        links: 1,
        fallback: 2,
        sizes: 3,
        width: 4,
        responsive: 5,
        classes: 6,
        caption: 7,
        link: 8,
        openAsNew: 9,
        settings: 10
    }
    const buttonTypes = { html: 'html', json: 'json' };
    const storageKey = "ghostEmbedGenerator-";

    let htmlButton = document.getElementById('generate-html');
    let jsonButton = document.getElementById('generate-json');
    let resetButton = document.getElementById('reset-generator');

    let clipboardButton = document.getElementById('copy-to-clipboard');
    let outputField = document.getElementById('output-space');
    let errorField = document.getElementById('generator-errors');
    let previewField = document.getElementById('html-preview');
    let settingsField = document.getElementById('settings-json');
    let selector = document.getElementById('select-html-snippet');


    // Load and save settings
    // -----------------------------------------------------------------------------------------
    function storeData(snippet, data) {
        localStorage.setItem(storageKey + snippet, data ? JSON.stringify(data) : '');
    }
    function loadData(snippet) {
        try {
            let data = localStorage.getItem(storageKey + snippet);

            if (data !== '') {
                data = JSON.parse(localStorage.getItem(storageKey + snippet));
            }
            return data;
        } catch (e) {
            console.log(e);
        }
        return '';
    }
    function inputDataToExtraSettings(data) {
        if (data !== '') {
            let output = JSON.stringify(data, false, 4);
            settingsField.value = output === 'null' ? '' : output;
        } else {
            settingsField.value = '';
        }

    }

    // Storage handling
    // -----------------------------------------------------------------------------------------
    selector.addEventListener('change', switchForm);
    resetButton.addEventListener('click', event => {
        storeData(selector.value, false);
    });

    function switchForm() {
        let settingData = loadData(selector.value);
        if (settingData !== '' && validateForm()) {
            let data = processForm();
            storeData(data.snippet, data);
        }

        // Reset output
        outputField.value = '';
        removeChildren(previewField);
        inputDataToExtraSettings(settingData);
        return true;
    }

    // Button handlers
    // -----------------------------------------------------------------------------------------
    htmlButton.addEventListener('click', event => {
        event.preventDefault();
        processClick(buttonTypes.html);
    });
    jsonButton.addEventListener('click', event => {
        event.preventDefault();
        processClick(buttonTypes.json);
    });
    clipboardButton.addEventListener('click', event => {
        navigator.clipboard.writeText(outputField.value);
    });

    // Process pipeline
    // -----------------------------------------------------------------------------------------
    function processClick(type) {
        errorField.innerText = '';
        let data = {};
        if (validateForm()) {
            data = processForm();
            storeData(data.snippet, data);
            switch (type) {
                case buttonTypes.html:
                    pickGenerator(data);
                    break;
                case buttonTypes.json:
                    outputField.value = JSON.stringify(data, false, 4);
                    break;
                default:
                    break;
            }
            document.getElementById('generator-output').scrollIntoView({ behavior: 'smooth' });
        } else {
            return false;
        }
    }

    function pickGenerator(data) {
        let generatedHTML = '';
        switch (data.snippet) {
            case 'image':
                generatedHTML = generateGalleryCard(data);
                break;
            case 'gallery':
                generatedHTML = generateGallery(data);
                break;
            case 'gallery-narrow':
                break;
            case 'gallery-flowing':
                break;
            case 'bookmark':
                generatedHTML = generateBookmarkCard(data);
                break;
            case 'video':
                generatedHTML = generateVideoCard(data);
                break;
            default:
                writeError('No matching generator found.');
                break;
        }
        outputField.value = generatedHTML.outerHTML;
        // change if better solution found
        removeChildren(previewField).appendChild(generatedHTML);
    }

    // HTML Generation
    // -----------------------------------------------------------------------------------------

    // HTML Generation - const variables
    // -----------------------------------------------------------------------------------------
    const mimeTypes = {
        'mp4': 'video/mp4',
        'ogg': 'video/ogg',
        'ogv': 'video/ogv',
        'mov': 'video/quicktime',
        'webm': 'video/webm',
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
    const fallbackImageType = ['svg', 'jpeg', 'jpg', 'png', 'gif'];
    const videoTypes = ['mp4', 'ogg', 'ogv', 'mov', 'mkv'];
    const mediaTypes = {
        'image': 'img',
        'video': 'video'
    }
    const defaultImageLink = '/content/images/';
    const imgWidth = {
        'normal': ['300', '400', '500', '600', '700', '800', '1200', '1200', '1500'],
        'half': ['300', '400', '500', '600', '700'],
        'gallery': ['200', '300', '400', '500', '600'],
        'bookmark': ['300', '400', '500', '600'],
        'full': ['400', '500', '600', '700', '800', '900', '1000', '1150', '1500', '2000'],
        'gallery-flowing': ['200', '300', '400'],
    };
    const imageSizes = {
        'normal': '(min-width: 2281px) 1500px, (min-width: 1681px) 1200px, (min-width: 900px) 720px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'half': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'gallery': '(min-width: 2281px) 700px, (min-width: 1681px) 600px, (min-width: 900px) 350px, (min-width: 737px) 55vw, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'bookmark': '(min-width: 2281px) 600px, (min-width: 1681px) 480px, (min-width: 737px) 300px, (min-width: 481px) 75vw, (min-width: 376px) 90vw, 300px',
        'full': '(min-width: 2281px) 2000px, (min-width: 1681px) 1536px, (min-width: 1281px) 1152px, (min-width: 981px) 1056px, (min-width: 481px) 70vw, 100vw',
        'gallery-flowing': '(min-width: 1681px) 300px, (min-width: 737px) 200px, (min-width: 567px) 35vw, 200px'
    }
    const cardToResponsiveType = {
        'image': 'normal',
        'image.kg-width-half': 'half',
        'image.kg-width-full': 'full',
        'gallery': 'gallery',
        'gallery.kg-width-half': 'gallery',
        'gallery.kg-width-full': 'gallery',
        'bookmark': 'bookmark',
        'bookmark.kg-width-half': 'bookmark',
        'bookmark.kg-width-full': 'bookmark',
        'gallery-flowing': 'gallery-flowing',
        'gallery-flowing.kg-width-half': 'gallery-flowing',
        'gallery-flowing.kg-width-full': 'gallery-flowing',
        'gallery-narrow': 'normal',
        'gallery-narrow.kg-width-half': 'half',
        'gallery-narrow.kg-width-full': 'full'
    };
    // HTML Generation - element generation
    // -----------------------------------------------------------------------------------------  
    function generateGalleryCard(data) {
        let figure = generateElement('figure', ['kg-card', 'kg-image-card'].concat(data.classes || ''));
        figure.appendChild(generateMedia(data, 0, mediaTypes.image));

        if (data.caption) {
            figure.appendChild(generateFigureCaption(data.caption));
        }
        if (data.link) {
            figure = wrapInLink(figure, generateLink(data.link, data.openAsNew, ''));
        }
        return figure;
    }

    function generateGallery(data) {
        let galleryRows = 0;
        let galleryColumns = 3;
        galleryRows = Math.floor(data?.links.length || 0 / galleryColumns);

        let figure = generateElement('figure', ['kg-card', 'kg-gallery-card'].concat(data.classes || ''));
        let container = generateElement('div', 'kg-gallery-container');
        figure.appendChild(container);

        let row = {}
        for (let i = 0; i < data?.links.length; i++) {
            if ((i % galleryColumns) === 0) {
                row = generateElement('div', 'kg-gallery-row');
                container.appendChild(row);
            }

            let galleryImage = generateElement('div', 'kg-gallery-image');
            galleryImage.style = `flex:flex: 1.77778 1 0%;`

            let isVideo = isVideoLink(data.links[i].link);
            if (isVideo) {
                galleryImage.classList.add('kg-video');

                if (data.links[i]['aspect-ratio']) {
                    galleryImage.style += `padding-bottom:${calcAspectRatio(data.mediaLinks[i]['aspect-ratio'])}%;`;
                }
            }

            galleryImage.appendChild(generateMedia(data, data.mediaLinks[i], isVideo ? mediaTypes.video : mediaTypes.image));
            row.appendChild(galleryImage);
        }
        return figure;
    }

    function generateBookmarkCard(data) {
        let figure = generateElement('figure', ['kg-card', 'kg-bookmark-card'].concat(data.classes || ''));
        let bookmarkContainer = generateLink(data.link || '', data.openAsNew, 'kg-bookmark-container');

        let bookmarkContent = generateElement('div', 'kg-bookmark-content'),
            bookmarkTitle = generateElement('div', 'kg-bookmark-title'),
            bookmarkDescription = generateElement('div', 'kg-bookmark-description'),
            bookmarkMetadata = generateElement('div', 'kg-bookmark-metadata'),
            bookmarkIcon = generateElement('div', 'kg-bookmark-icon'),
            bookmarkAuthor = generateElement('div', 'kg-bookmark-author'),
            bookmarkPublisher = generateElement('div', 'kg-bookmark-publisher'),
            bookmarkThumbnail = generateElement('div', 'kg-bookmark-thumbnail');

        let bookmarkImage = generateMedia(data, 0, mediaTypes.image);

        figure.appendChild(bookmarkContainer);
        bookmarkContainer.appendChild(bookmarkContent, bookmarkThumbnail);
        bookmarkContent.appendChild(bookmarkTitle).appendChild(bookmarkDescription).appendChild(bookmarkMetadata);
        bookmarkMetadata.appendChild(bookmarkIcon, bookmarkAuthor, bookmarkPublisher);
        bookmarkThumbnail.appendChild(bookmarkImage);

        if (data.links?.[0]?.bookmark.title) {
            bookmarkTitle.innerText = data.links[0]?.bookmark.title;
        }
        if (data.links?.[0]?.bookmark.description) {
            bookmarkDescription.innerText = data.links[0]?.bookmark.description;
        }
        if (data.links?.[0]?.bookmark.icon) {
            bookmarkIcon.src = data.links[0]?.bookmark.icon;
        }
        if (data.links?.[0]?.bookmark.author) {
            bookmarkAuthor.innerText = data.links[0]?.bookmark.author;
        }
        if (data.links?.[0]?.bookmark.publisher) {
            bookmarkPublisher.innerText = data.links[0]?.bookmark.publisher;
        }

        return figure;
    }

    function generateVideoCard(data) {
        let figure = generateElement('figure', ['kg-card', 'kg-video-card'].concat(data.classes || ''));

        figure.appendChild(generateVideoContainer(data, 0));

        if (data.caption) {
            figure.appendChild(generateFigureCaption(data.caption));
        }

        if (data.link) {
            figure = wrapInLink(figure, generateLink(data.link, data.openAsNew, ''));
        }
        return figure;
    }

    // HTML Generation - sub element generation
    // ----------------------------------------------------------------------------------------- 
    function generateVideoContainer(data, mediaLink) {
        let aspectRatio = '';
        let container = document.createElement('div');
        container.classList.add('kg-video');
        if (mediaLink['aspect-ratio']) {
            aspectRatio = `padding-bottom:${calcAspectRatio(mediaLink['aspect-ratio'])}%;`;
        }
        container.style = aspectRatio;
        container.appendChild(generateMedia(data, mediaLink, mediaTypes.video));

        return container;
    }
    /**
     * Generates a sngle image block
     * @param {object} data from form validation
     * @param {object} mediaLink
     * @param {{'image', 'video'}} type media type -> image, video
     * @returns DOM Object
     */
    function generateMedia(data, mediaLink, type) {
        let fileType = getFileType(mediaLink.link);
        let fallbacks = [];
        let srcset = '';
        let sizes = '';
        let mediaElement = {};
        let alt = cleanAttr(data.caption) || '';
        let styles = '';

        //Handle responsiveness
        if (mediaLink.link && isGhostLink(mediaLink.link) && data.isResponsive && type === mediaTypes.image) {
            srcset = generateSrcSet(mediaLink.link, data.responsiveType);
        }

        if (data.sizes && data.sizes !== '' && type === mediaTypes.image) {
            sizes = data.sizes;
        } else if (data.isResponsive && type === mediaTypes.image) {
            sizes = imageSizes[data.responsiveType] || '';
        }

        //Handle custom fallsbacks
        for (let fallback in mediaLink.fallback) {
            let tempFallback = {};

            if (fallback.link && type === mediaTypes.image) {
                tempFallback.link = fallback.link;

                if (fallback.srcset) {
                    tempFallback.srcset = fallback.srcset;
                } else if (isGhostLink(fallback.link)) {
                    tempFallback.srcset = generateSrcSet(fallback.link, data.responsiveType);
                }

                if (fallback.sizes) {
                    tempFallback.sizes = fallback.sizes;
                } else if (isGhostLink(fallback.link)) {
                    tempFallback.sizes = sizes;
                }
                fallbacks.push(tempFallback);
            } else if (fallback.link && type === mediaTypes.video) {
                fallbacks.push({
                    link: fallback.link,
                    srcset: '',
                    sizes: ''
                })
            }
        }
        /* Add default image last if custom fallbacks */
        if (mediaLink.fallback) {
            let tempFallback = {};
            tempFallback.link = mediaLink.link || '';

            if (fileType !== 'svg' && type === mediaTypes.image) {
                tempFallback.srcset = srcset;
                tempFallback.sizes = sizes;
            } else {
                tempFallback.srcset = '';
                tempFallback.sizes = '';
            }
            fallbacks.push(tempFallback);
        }
        if (isGhostLink(mediaLink.link) && !mediaLink.fallback) {
            let fallbacks = [fileType]
            for (let fallbackType in data.fallbackTypes) {
                if (!fallbacks.includes(fallbackType[fileType])) {
                    fallbacks.push(fallbackType[fileType]);
                }
            }

            for (let fallbackType in fallbacks) {
                let tempFallback = {};
                tempFallback.link = mediaLink.link.replaceAll("." + fileType, "." + fallbackType);

                if (fallbackType !== 'svg' && type === mediaTypes.image) {
                    tempFallback.srcset = srcset.replaceAll("." + fileType, "." + fallbackType);
                    tempFallback.sizes = sizes;
                } else {
                    tempFallback.srcset = '';
                    tempFallback.sizes = '';
                }
                tempFallback.fileType = fallbackType;

                fallbacks.push(tempFallback);
            }
        }

        //Handle styles
        if (mediaLink['aspect-ratio']) {
            let aspectRatio = mediaLink['aspect-ratio'][0] + '/' + mediaLink['aspect-ratio'][1];
            styles += `object-fit:${aspectRatio};`
        }
        if (mediaLink['object-fit']) {
            styles += `object-fit:${mediaLink['object-fit']};`;
        }
        if (mediaLink['object-position']) {
            styles += `object-fit:${mediaLink['object-position']};`;
        }

        // Create export element
        if (type === mediaTypes.image) {
            if (fallbacks.length > 1) {
                let picture = document.createElement('picture');
                picture.classList.add('kg-image');

                for (let i = 0; i < fallbacks.length; i++) {
                    let img = {};
                    if (i + 1 === fallbacks.length) {
                        img.generateImgElement(fallbacks[i].link,
                            fallbacks[i].srcset,
                            fallbacks[i].sizes,
                            alt);
                    } else {
                        img.generateSourceElement(fallbacks[i].link,
                            fallbacks[i].srcset,
                            fallbacks[i].fileType,
                            fallbacks[i].sizes,
                            mediaTypes.image);
                    }
                    img.style = styles;
                    picture.appendChild(img);
                }
                mediaElement = picture;
            } else if (fallbacks.length > 0) {
                let img = generateImgElement(fallbacks[0].link, fallbacks[0].srcset, fallbacks[0].sizes, alt);
                img.style = styles;
                mediaElement = img;
            } else {
                let img = generateImgElement('', srcset, sizes, alt);
                img.style = styles;
                mediaElement = img;
            }
        } else if (type === mediaTypes.video && mediaLink.video) {
            let video = document.createElement('video');
            video.autoplay = mediaLink.video.autoplay || true;
            video.loop = mediaLink.video.loop || true;
            video.muted = mediaLink.video.muted || true;
            video.controls = mediaLink.video.controls || false;
            video.poster = mediaLink.video.poster || '';
            video.preload = mediaLink.video.preload || preloadHTML[0];

            for (let fallback in fallbacks) {
                video.appendChild(generateSourceElement(fallback.link,
                    '',
                    fallback.fileType,
                    '',
                    mediaTypes.video));
            }
            mediaElement = video;
        }

        //wrap media in link
        if (!data.link && mediaLink['target-href']) {
            let a = generateLink(mediaLink['target-href'], data.openAsNew, '');
            a.appendChild(mediaElement);
            mediaElement = a;
        }

        return mediaElement;
    }

    function generateSourceElement(src, srcset, fileType, media, mediaType) {
        let source = Object.assign(document.createElement('source'), {
            src: src || '',
            srcset: srcset || '',
            type: mimeTypes[fileType] || '',
            media: media || ''
        });

        switch (mediaType) {
            case mediaTypes.image:
                source.loading = 'lazy';
                source.classList.add('kg-image');
                break;
            case mediaTypes.video:
                break;
            default:
                break;
        }
        return source;
    }
    function generateImgElement(src, srcset, sizes, alt) {
        if (isGhostLink(src)) {
            src = createSubLink(src, '');
        }
        let img = Object.assign(document.createElement('img'), {
            src: src || '',
            srcset: srcset || '',
            sizes: sizes || '',
            alt: alt || ''
        });
        img.classList.add('kg-image');
        return img;
    }

    function generateFigureCaption(captionText) {
        let caption = document.createElement('figcaption');
        caption.innerText = captionText;
        return caption;
    }

    function generateElement(tagname, classes) {
        let el = document.createElement(tagname);
        el.classList.add(classes);
        return el;
    }

    function generateLink(href, openAsNew, classes) {
        let a = Object.assign(document.createElement('a'), {
            href: href,
            target: openAsNew ? '_blank' : ''
        });
        a.classList(classes);

        return a;
    }
    function wrapInLink(parent, wrapper) {
        for (let child in parent) {
            wrapper.appendChild(child);
        }
        return parent.appendChild(wrapper);
    }
    // HTML Generation - generation helper methods
    // -----------------------------------------------------------------------------------------  
    function generateSrcSet(href, type) {
        var srcset = '';
        for (let size in imgWidth[type]) {
            srcset += createSubLink(href, imgWidth[type][size]) + ` ${imgWidth[type][size]}w,`;
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
        } else {
            href = href.replace('/images/', '/images/size' + size);
        }
        return href;
    }
    function isVideoLink(href) {
        if (typeof href === 'string' && videoTypes[getFileType(href)]) {
            return true;
        }
        false;
    }
    function calcAspectRatio(aspectRatio) {
        return aspectRatio[1] * 100 / aspectRatio[0];
    }
    // Form validation
    // -----------------------------------------------------------------------------------------
    function validateForm() {
        if (document.forms[0]) {
            //Check snippet selection
            if (!htmlSnippetTypes.includes(document.forms[0][formElementID.snippet].value)) {
                writeError("Snippet doesn't exist.");
                return false;
            }
            return true;
        }
        return false;
    }
    function processForm() {
        let data = {};
        let settings = document.forms[0][formElementID.settings].value;
        let linkList = document.forms[0][formElementID.links].value;
        let fallbackTypes = document.forms[0][formElementID.fallback].value;
        let classes = document.forms[0][formElementID.classes].value;
        let caption = document.forms[0][formElementID.caption].value;
        let wrapperLink = document.forms[0][formElementID.link].value;
        let sizes = document.forms[0][formElementID.sizes].value;
        let width = document.forms[0][formElementID.width].value;
        let enableResponsive = document.forms[0][formElementID.responsive].checked;
        let openAsNew = document.forms[0][formElementID.openAsNew].checked;

        data.snippet = document.forms[0][formElementID.snippet].value;

        if (settings !== '') {
            try {
                settings = JSON.parse(settings);
                if (htmlSnippetTypes.includes(settings.snippet)) {
                    data.snippet = settings.snippet;
                }

                if (settings.mediaLinks && settings.mediaLinks.length) {
                    data.mediaLinks = parseLinks(settings.mediaLinks);
                }

                if (settings.fallbackTypes?.length) {
                    data.fallbackTypes = settings.fallbackTypes;
                }

                if (settings.classes) {
                    data.classes = cleanAttr(settings.classes).replaceAll('.', '');
                    data.classes = data.classes.split(/\s/);
                }
                if (settings.caption) {
                    data.caption = settings.caption;
                }
                if (settings.link) {
                    data.link = cleanAttr(settings.link);
                }
                if (settings.sizes) {
                    data.sizes = cleanAttr(settings.sizes);
                }
                if (settings.width) {
                    data.width = parseCustomWidth(width);
                }

                settings.openAsNew = convertTextToBool(settings.openAsNew);
                if (settings.openAsNew) {
                    data.openAsNew = settings.openAsNew;
                }

                settings.enableResponsive = convertTextToBool(settings.enableResponsive);
                if (settings.enableResponsive) {
                    data.enableResponsive = settings.enableResponsive;
                }
            } catch (e) {
                console.log(settings, e);
            }
        }

        try {
            if (linkList !== '') {
                linkList = JSON.parse(linkList);
                data.mediaLinks = parseLinks(linkList);
            }
        } catch (e) {
            console.log(linkList, e)
        }


        try {
            if (fallbackTypes !== '') {
                fallbackTypes = JSON.parse(fallbackTypes);
                if (fallbackTypes.length) {
                    data.fallbackTypes = fallbackTypes;
                }
            }
        } catch (e) {
            console.log(fallbackTypes, e);
        }

        if (classes !== '') {
            data.classes = cleanAttr(classes).replaceAll('.', '');
            data.classes = data.classes.split(/\s/);
        }
        if (caption !== '') {
            data.caption = caption;
        }
        if (wrapperLink !== '') {
            data.link = cleanAttr(wrapperLink);
        }

        if (sizes !== '') {
            data.sizes = cleanAttr(sizes);
        }
        if (width !== '') {
            try {
                width = JSON.parse(width);
                data.width = parseCustomWidth(width);
            } catch (e) {
                console.log(width, e)
            }
        }

        data.isResponsive = enableResponsive;
        data.openAsNew = openAsNew;

        let tempCardType = data.snippet;

        if (data.classes?.length) {
            if (data.classes.includes('kg-width-half')) {
                tempCardType += '.kg-width-half';
            } else if (data.classes.includes('kg-width-full')) {
                tempCardType += '.kg-width-full';
            }
        }
        data.responsiveType = cardToResponsiveType[tempCardType];

        return data;
    }

    function writeError(error) {
        errorField.innerText = `An error occured: ${error}`;
    }
    // Form validation helper functions
    // -----------------------------------------------------------------------------------------
    function parseCustomWidth(widthArr) {
        let width = [];
        for (let i = 0; i < widthArr.length; i++) {
            if (widthArr[i].matches(/^\d+$/g)) {
                width.push(widthArr[i]);
            }
        }
        return width;
    }

    function parseLinks(linkList) {
        let links = [];

        if (linkList.length && typeof linkList[0] === 'string') {
            for (let i = 0; i < linkList.length; i++) {
                links.push({ link: linkList[i].replaceAll('"', '').trim() });
            }
        } else {
            for (let i = 0; i < linkList.length; i++) {
                let tempLink = {}
                if (typeof linkList[i] === 'string') {
                    tempLink.link = cleanAttr(linkList[i]);
                } else {
                    if (linkList[i].link) {
                        tempLink.link = cleanAttr(linkList.link);
                    }
                    if (linkList[i].metadata) {
                        tempLink.metadata = {};

                        if (linkList[i].metadata['aspect-ratio'] !== undefined &&
                            linkList[i].metadata['aspect-ratio'].match(/^\d+\/\d+$/)) {
                            tempLink.metadata.aspectRatio = linkList[i].metadata['aspect-ratio'].split('/');
                        }

                        if (linkList[i].metadata['object-fit'] !== '' &&
                            objectFitCSS.includes(linkList[i].metadata['object-fit'])) {
                            tempLink.metadata.objectFit = cleanAttr(linkList[i].metadata['object-fit']);
                        }

                        if (linkList[i].metadata['object-position']) {
                            tempLink.metadata.objectPosition = cleanAttr(linkList[i].metadata['object-position']);
                        }

                        if (linkList[i].metadata['target-href']) {
                            tempLink.metadata.href = cleanAttr(linkList[i].metadata['target-href']);
                        }

                        if (linkList[i].metadata['open-as-new']) {
                            tempLink.metadata.openAsNew = linkList[i].metadata['open-as-new'] === true ? true : false;
                        }

                        if (linkList[i].metadata['srcset']) {
                            tempLink.metadata.srcset = cleanAttr(linkList[i].metadata['srcset']);
                        }

                        tempLink.metadata.fallback = [];
                        for (let j = 0; j = linkList[i].metadata['fallback'].length; j++) {
                            let tempFallback = {};

                            if (linkList[i].metadata['fallback'][j].link) {
                                tempFallback.link = cleanAttr(linkList[i].metadata['fallback'][j].link);

                                if (linkList[i].metadata['fallback'][j].srcset) {
                                    tempFallback.srcset = cleanAttr(linkList[i].metadata['fallback'][j].srcset);
                                }
                                if (linkList[i].metadata['fallback'][j].sizes) {
                                    tempFallback.sizes = cleanAttr(linkList[i].metadata['fallback'][j].sizes);
                                }
                                tempLink.metadata.fallback.push(tempFallback);
                            }
                        }
                    }
                    if (linkList[i].video) {
                        if (linkList[i].video['loop']) {
                            tempLink.video.loop = convertTextToBool(linkList[i].video['loop']);
                        }
                        if (linkList[i].video['autoplay']) {
                            tempLink.video.autoplay = convertTextToBool(linkList[i].video['autoplay']);
                        }
                        if (linkList[i].video['muted']) {
                            tempLink.video.muted = convertTextToBool(linkList[i].video['muted']);
                        }
                        if (linkList[i].video['controls']) {
                            tempLink.video.controls = convertTextToBool(linkList[i].video['controls']);
                        }
                        if (preloadHTML.includes(linkList[i].video['preload'])) {
                            tempLink.video.preload = linkList[i].video['preload'];
                        }
                        if (linkList[i].video['poster']) {
                            tempLink.video.poster = cleanAttr(linkList[i].video['poster']);
                        }
                    }
                    if (linkList[i].bookmark) {
                        if (linkList[i].bookmark['title']) {
                            tempLink.bookmark.title = linkList[i].bookmark['title'];
                        }
                        if (linkList[i].bookmark['description']) {
                            tempLink.bookmark.description = linkList[i].bookmark['description'];
                        }
                        if (linkList[i].bookmark['icon']) {
                            tempLink.bookmark.icon = linkList[i].bookmark['icon'];
                        }
                        if (linkList[i].bookmark['author']) {
                            tempLink.bookmark.author = linkList[i].bookmark['author'];
                        }
                        if (linkList[i].bookmark['publisher']) {
                            tempLink.bookmark.publisher = linkList[i].bookmark['publisher'];
                        }
                    }
                }
                links.push(tempLink);
            }
        }
        return links;
    }



    // General helper functions
    // -----------------------------------------------------------------------------------------

    function convertTextToBool(text) {
        if (text === 'true') {
            return true;
        }
        if (text === 'false') {
            return false;
        }
        if (typeof text === 'boolean') {
            return true;
        }
    }
    function getFileType(href) {
        try {
            if (href !== undefined && href !== '') {
                var match = new URL(href).pathname.match(/\.([\w]){1,}$/gi);

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
    function cleanAttr(text) {
        return text?.replaceAll('"', '').trim();
    }
    function isGhostLink(href) {
        if (href && typeof href === 'string' && href.match(defaultImageLink)) {
            return true;
        }
        return false;
    }
    function removeChildren(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        return parent;
    }

    // Init after load
    // -----------------------------------------------------------------------------------------
    switchForm();
};

window.addEventListener('load', ghostEmbedGenerator);