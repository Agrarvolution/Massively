'use strict';

var ghostEmbedGenerator = () => {
    const htmlSnippetTypes = ['image', 'gallery', 'gallery-narrow', 'gallery-flowing', 'bookmark', 'video'];
    const galleryCardClasses = {
        narrow: 'kg-gallery-container--narrow',
        flowing: 'kg-gallery-container--flowing'
    };
    const objectFitCSS = ['fill', 'contain', 'cover', 'none', 'scale-down', 'inherit', 'initial', 'revert', 'unset'];
    const preloadHTML = ['auto', 'metadata', 'none'];
    const buttonTypes = { html: 'html', json: 'json' };
    const storageKey = "ghostEmbedGenerator-";
    const linkTemplate = {
        link: "",
        metadata: {
            "aspect-ratio": "",
            "object-fit": "",
            "object-position": "",
            "target-href": "",
            "open-as-new": '',
            srcset: "",
            preload: "",

        },
        fallback: [{
            link: "",
            srcset: "",
            sizes: ""
        }],
        video: {
            muted: "",
            loop: "",
            autoplay: "",
            controls: '',
            poster: ""
        },
        bookmark: {
            title: "",
            description: "",
            icon: "",
            author: "",
            publisher: ""
        }
    }



    let htmlButton = document.getElementById('generate-html');
    let jsonButton = document.getElementById('generate-json');
    let resetButton = document.getElementById('reset-generator');
    let clipboardButton = document.getElementById('copy-to-clipboard');

    let linkField = document.getElementById('link-json');
    let outputField = document.getElementById('output-space');
    let errorField = document.getElementById('generator-errors');
    let previewField = document.getElementById('html-preview');
    let settingsField = document.getElementById('settings-json');
    let selector = document.getElementById('select-html-snippet');

    let snippetState = sessionStorage.getItem(storageKey + "snippet") || 'image';

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
    selector.value = snippetState;

    selector.addEventListener('change', snippetChange);
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

    function snippetChange() {
        snippetState = selector.value;
        sessionStorage.setItem(storageKey + 'snippet', snippetState);
        return switchForm();
    }

    function addLinkTemplate(displayFallback) {
        let helper = JSON.parse(JSON.stringify(linkTemplate));

        switch (selector.value) {
            case 'image':
            case 'gallery':
            case 'gallery-narrow':
            case 'gallery-flowing':
            default:
                delete helper.bookmark,
                    helper.video;
                break;
            case 'video':
                delete helper.bookmark,
                    helper.metadata.srcset;
            case 'bookmark':
                delete helper.video;
        }

        if (!displayFallback) {
            delete helper.fallback;
        }

        if (linkField.value === '') {
            linkField.value = JSON.stringify([helper], false, 4);
        } else {
            let currentLinks = [];
            try {
                currentLinks = JSON.parse(linkField.value);
                console.log(currentLinks);
                if (!currentLinks.length) {
                    currentLinks = [currentLinks];
                }
                currentLinks.push(helper);
                linkField.value = JSON.stringify(currentLinks, false, 4);
            } catch (e) {
                linkField.value += '\r\n' + JSON.stringify([helper], false, 4);
            }           
        }
    }
    function removeLinkTemplate(isLast) {
        if (linkField.value === '') {
            return false;
        }
        try {
            let links = JSON.parse(linkField.value);
            if (links.length) {
                if (isLast) {
                    links.pop();
                } else {
                    links.push();
                }
                linkField.value = JSON.stringify(links, false, 4);
            }
        } catch (e) {
            console.log(e);
        }
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
    document.getElementById('add-link-template').addEventListener('click', event => {
        event.preventDefault();
        addLinkTemplate(false);
    });
    document.getElementById('add-link-template-fallback').addEventListener('click', event => {
        event.preventDefault();
        addLinkTemplate(true);
    });
    document.getElementById('add-link-template-remove-last').addEventListener('click', event => {
        event.preventDefault();
        removeLinkTemplate(true);
    });
    document.getElementById('add-link-template-remove-first').addEventListener('click', event => {
        event.preventDefault();
        removeLinkTemplate(false);
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
                generatedHTML = generateImageCard(data);
                break;
            case 'gallery':
                generatedHTML = generateGalleryCard(data);
                break;
            case 'gallery-narrow':
                generatedHTML = generateGalleryRowlessCard(data, galleryCardClasses.narrow);
                break;
            case 'gallery-flowing':
                generatedHTML = generateGalleryRowlessCard(data, galleryCardClasses.flowing);
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
        if (generatedHTML instanceof HTMLElement) {
            removeChildren(previewField).appendChild(generatedHTML);
        }
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
        'normal': ['300', '400', '500', '600', '700', '800', '1000', '1200', '1500'],
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
    function generateImageCard(data) {
        let figure = generateElement('figure', ['kg-card', 'kg-image-card'].concat(data.classes || ''));
        figure.appendChild(generateMedia(data, data.mediaLinks[0], mediaTypes.image));

        if (data.caption) {
            figure.appendChild(generateFigureCaption(data.caption));
        }
        if (data.link) {
            figure = wrapInLink(figure, generateLink(data.link, data.openAsNew, ''));
        }
        return figure;
    }

    function generateGalleryCard(data) {
        let galleryRows = 0;
        let galleryColumns = 3;
        galleryRows = Math.floor(data.mediaLinks?.length || 0 / galleryColumns);

        let figure = generateElement('figure', ['kg-card', 'kg-gallery-card'].concat(data.classes || ''));
        let container = generateElement('div', 'kg-gallery-container');
        figure.appendChild(container);

        let row = {}
        for (let i = 0; i < data.mediaLinks?.length; i++) {
            if ((i % galleryColumns) === 0) {
                row = generateElement('div', 'kg-gallery-row');
                container.appendChild(row);
            }

            let galleryImage = generateElement('div', 'kg-gallery-image');
            galleryImage.style = `flex: 1.5 1 0%;`

            let isVideo = isVideoLink(data.mediaLinks[i].link);
            if (isVideo) {
                galleryImage.classList.add('kg-video');

                if (data.mediaLinks[i]['aspect-ratio']) {
                    galleryImage.style += `padding-bottom:${calcAspectRatio(data.mediaLinks[i]['aspect-ratio'])}%;`;
                }
            }

            galleryImage.appendChild(generateMedia(data, data.mediaLinks[i], isVideo ? mediaTypes.video : mediaTypes.image));
            row.appendChild(galleryImage);
        }

        if (data.caption) {
            figure.appendChild(generateFigureCaption(data.caption));
        }
        if (data.link) {
            figure = wrapInLink(figure, generateLink(data.link, data.openAsNew, ''));
        }
        return figure;
    }

    function generateGalleryRowlessCard(data, galleryType) {
        let figure = generateElement('figure', ['kg-card', 'kg-gallery-card'].concat(data.classes || ''));
        let container = generateElement('div', ['kg-gallery-container', galleryType]);
        figure.appendChild(container);

        for (let i = 0; i < data.mediaLinks?.length; i++) {
            let galleryImage = generateElement('div', 'kg-gallery-image');

            let isVideo = isVideoLink(data.mediaLinks[i].link);
            if (isVideo) {
                galleryImage.classList.add('kg-video');

                if (data.mediaLinks[i]['aspect-ratio']) {
                    galleryImage.style += `padding-bottom:${calcAspectRatio(data.mediaLinks[i]['aspect-ratio'])}%;`;
                }
            }

            galleryImage.appendChild(generateMedia(data, data.mediaLinks[i], isVideo ? mediaTypes.video : mediaTypes.image));
            container.appendChild(galleryImage);
        }

        if (data.caption) {
            figure.appendChild(generateFigureCaption(data.caption));
        }
        if (data.link) {
            figure = wrapInLink(figure, generateLink(data.link, data.openAsNew, ''));
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

        let bookmarkImage = generateMedia(data, data.mediaLinks[0], mediaTypes.image);

        figure.appendChild(bookmarkContainer);

        bookmarkContainer.appendChild(bookmarkContent);
        bookmarkContainer.appendChild(bookmarkThumbnail);

        bookmarkContent.appendChild(bookmarkTitle);
        bookmarkContent.appendChild(bookmarkDescription);
        bookmarkContent.appendChild(bookmarkMetadata);

        bookmarkMetadata.appendChild(bookmarkIcon);
        bookmarkMetadata.appendChild(bookmarkAuthor);
        bookmarkMetadata.appendChild(bookmarkPublisher);

        bookmarkThumbnail.appendChild(bookmarkImage);
        if (data.mediaLinks?.[0]?.bookmark?.title) {
            bookmarkTitle.innerText = data.mediaLinks[0]?.bookmark.title;
        }
        if (data.mediaLinks?.[0]?.bookmark?.description) {
            bookmarkDescription.innerText = data.mediaLinks[0]?.bookmark.description;
        }
        if (data.mediaLinks?.[0]?.bookmark?.icon) {
            bookmarkIcon.src = data.mediaLinks[0]?.bookmark.icon;
        }
        if (data.mediaLinks?.[0]?.bookmark?.author) {
            bookmarkAuthor.innerText = data.mediaLinks[0]?.bookmark.author;
        }
        if (data.mediaLinks?.[0]?.bookmark?.publisher) {
            bookmarkPublisher.innerText = data.mediaLinks[0]?.bookmark.publisher;
        }

        return figure;
    }

    function generateVideoCard(data) {
        let figure = generateElement('figure', ['kg-card', 'kg-video-card'].concat(data.classes || ''));

        figure.appendChild(generateVideoContainer(data, data.mediaLinks[0], mediaTypes.video));

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
     * Generates a single image block
     * @param {object} data from form validation
     * @param {object} mediaLink
     * @param {{'image', 'video'}} type media type -> image, video
     * @returns DOM Object
     */
    function generateMedia(data, mediaLink, type) {
        let fileType = getFileType(mediaLink?.link);
        let fallbacks = [];
        let srcset = '';
        let sizes = '';
        let mediaElement = {};
        let alt = cleanAttr(data.caption) || '';
        let styles = '';

        if (fallbackImageType[fileType]) {
            type = mediaTypes.video;
        }

        //Handle responsiveness
        if (mediaLink?.link && isGhostLink(mediaLink.link) && data.isResponsive && type === mediaTypes.image) {
            srcset = generateSrcSet(mediaLink.link, data.responsiveType);
        }

        if (data.sizes && data.sizes !== '' && type === mediaTypes.image) {
            sizes = data.sizes;
        } else if (data.isResponsive && type === mediaTypes.image) {
            sizes = imageSizes[data.responsiveType] || '';
        }

        //Handle custom fallsbacks
        for (let fallback in mediaLink?.fallback) {
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
        if (mediaLink?.fallback) {
            let tempFallback = {};
            tempFallback.link = mediaLink.link || '';

            if (fileType !== 'svg' && type === mediaTypes.image) {
                tempFallback.srcset = srcset;
                tempFallback.sizes = sizes;
            }
            fallbacks.push(tempFallback);
        }
        if (isGhostLink(mediaLink?.link) && !mediaLink.fallback) {
            let fallbackTypes = [fileType];
            for (let fallbackType in data.fallbackTypes) {
                if (!fallbackTypes.includes(data.fallbackTypes[fallbackType][fileType])) {
                    fallbackTypes.push(data.fallbackTypes[fallbackType][fileType]);
                }
            }

            for (let fallbackType in fallbackTypes) {
                let tempFallback = {};
                tempFallback.link = mediaLink.link.replaceAll("." + fileType, "." + fallbackTypes[fallbackType]);

                if (fallbackTypes[fallbackType] !== 'svg' && type === mediaTypes.image) {
                    tempFallback.srcset = srcset.replaceAll("." + fileType, "." + fallbackTypes[fallbackType]);
                    tempFallback.sizes = sizes;
                }
                tempFallback.fileType = fallbackTypes[fallbackType];

                fallbacks.push(tempFallback);
            }
        }

        //Handle styles
        if (mediaLink?.['aspect-ratio']) {
            let aspectRatio = mediaLink['aspect-ratio'][0] + '/' + mediaLink['aspect-ratio'][1];
            styles += `object-fit:${aspectRatio};`
        }
        if (mediaLink?.['object-fit']) {
            styles += `object-fit:${mediaLink['object-fit']};`;
        }
        if (mediaLink?.['object-position']) {
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
                        img = generateImgElement(fallbacks[i].link,
                            fallbacks[i].srcset,
                            fallbacks[i].sizes,
                            alt);
                    } else {
                        img = generateSourceElement(fallbacks[i].link,
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
        } else if (type === mediaTypes.video) {
            let video = document.createElement('video');

            video.autoplay = true;
            if (mediaLink.video?.autoplay) {
                video.autoplay = mediaLink.video?.autoplay;
            }
            video.loop = true;
            if (mediaLink.video?.loop) {
                video.loop = mediaLink.video?.loop;
            }
            video.muted = true;
            if (mediaLink.video?.muted) {
                video.muted = mediaLink.video?.muted;
            }
            if (mediaLink.video?.controls) {
                video.controls = mediaLink.video?.controls;
            }
            if (mediaLink.video?.poster) {
                video.poster = mediaLink.video?.poster;
            }
            if (mediaLink.video?.preload) {
                video.preload = mediaLink.video?.preload;
            }

            for (let fallback in fallbacks) {
                video.appendChild(generateSourceElement(fallbacks[fallback].link,
                    '',
                    fallbacks[fallback].fileType,
                    '',
                    mediaTypes.video));
            }
            mediaElement = video;
        }

        //wrap media in link
        if (!data?.link && mediaLink?.['target-href']) {
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
                source.removeAttribute('src');
                source.loading = 'lazy';
                source.classList.add('kg-image');
                break;
            case mediaTypes.video:
                source.removeAttribute('srcset');
                source.removeAttribute('media');
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
        return addMultipleClasses(el, classes);
    }

    function generateLink(href, openAsNew, classes) {
        let a = Object.assign(document.createElement('a'), {
            href: href,
            target: openAsNew ? '_blank' : ''
        });
        return addMultipleClasses(a, classes);
    }
    function wrapInLink(parent, wrapper) {
        console.log(parent.children);
        while (parent.firstChild) {
            wrapper.appendChild(parent.firstChild);
            parent.firstChild.remove();
        }
        parent.appendChild(wrapper);
        console.log(parent);
        return parent;
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
    function addMultipleClasses(domEl, classes) {
        if (typeof classes === 'object') {
            classes = classes.filter(el => {
                return el != null && el !== undefined && el !== ''
            });

            try {
                domEl.classList.add(...classes);
            } catch (e) {
                console.log(classes, e);
            }
        } else if (typeof classes === 'string' && classes !== '') {
            domEl.classList.add(classes);
        }
        return domEl;
    }
    // Form validation
    // -----------------------------------------------------------------------------------------
    function validateForm() {
        if (document.forms[0]) {
            //Check snippet selection
            if (!htmlSnippetTypes.includes(document.getElementById('select-html-snippet').value)) {
                console.log(document.forms[0], document.getElementById('select-html-snippet'));
                writeError("Snippet doesn't exist.");
                return false;
            }
            return true;
        }
        return false;
    }
    function processForm() {
        let data = {};
        let settings = document.getElementById('settings-json');
        let linkList = document.getElementById('link-json').value;
        let fallbackTypes = document.getElementById('fallback-types').value;
        let classes = document.getElementById('figure-classes').value;
        let caption = document.getElementById('figure-caption').value;
        let wrapperLink = document.getElementById('wrapping-href').value;
        let sizes = document.getElementById('custom-sizes').value;
        let width = document.getElementById('custom-width').value;
        let enableResponsive = document.getElementById('enable-responsive').checked;
        let openAsNew = document.getElementById('open-link').checked;

        settings = settings.value === '' ? settings.innerText : settings.value;

        data.snippet = document.getElementById('select-html-snippet').value;

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
                    if (settings.classes.length) {
                        for (let figClass in settings.classes) {
                            settings.classes[figClass] = cleanAttr(settings.classes[figClass]);
                        }
                    } else {
                        settings.classes = cleanAttr(settings.classes).replaceAll('.', '').split(/\s/);
                    }
                    data.classes = settings.classes;
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

                data.openAsNew = convertTextToBool(settings.openAsNew);
                data.enableResponsive = convertTextToBool(settings.enableResponsive);
            } catch (e) {
                console.log(settings, e);
            }
        }

        if (linkList === '') {
            data.mediaLinks = data.mediaLinks?.length > 0 ? data.mediaLinks : 0;
        } else if (linkList.match(/^[^{[]/g)) {
            data.mediaLinks = [];
            linkList = cleanAttr(linkList).split(',');

            for (let link in linkList) {
                if (linkList[link].length !== 0) {
                    data.mediaLinks.push({
                        link: linkList[link].trim()
                    });
                }
            }
        } else {
            try {
                linkList = JSON.parse(linkList);

                data.mediaLinks = parseLinks(linkList);
                console.log(data.mediaLinks);
            } catch (e) {
                console.log(linkList, e)
            }
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
            if (typeof widthArr[i] === 'number' || widthArr[i].match(/^\d+$/g)) {
                width.push(widthArr[i]);
            }
        }
        return width;
    }

    function parseLinks(linkList) {
        let links = [];
        for (let i = 0; i < linkList.length; i++) {
            let tempLink = {}
            if (typeof linkList[i] === 'string') {
                tempLink.link = cleanAttr(linkList[i]);
            } else {
                if (linkList[i].link) {
                    tempLink.link = cleanAttr(linkList[i].link);
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
                }

                if (linkList[i]['fallback']) {
                    tempLink.fallback = [];
                    for (let j = 0; j < linkList[i]['fallback']?.length; j++) {
                        let tempFallback = {};
                        console.log(linkList[i]['fallback'], j);
                        if (linkList[i]['fallback'][j].link) {
                            tempFallback.link = cleanAttr(linkList[i]['fallback'][j].link);

                            if (linkList[i]['fallback'][j].srcset) {
                                tempFallback.srcset = cleanAttr(linkList[i]['fallback'][j].srcset);
                            }
                            if (linkList[i]['fallback'][j].sizes) {
                                tempFallback.sizes = cleanAttr(linkList[i]['fallback'][j].sizes);
                            }
                            tempLink.fallback.push(tempFallback);
                        }
                    }
                }

                if (linkList[i].video) {
                    tempLink.video = {};
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
                    tempLink.bookmark = {};
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
            console.log(tempLink);
            links.push(tempLink);
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
            return text;
        }
        return false;
    }
    function getFileType(href) {
        try {
            if (href != null && href !== undefined && href !== '') {
                var match = new URL(href).pathname.match(/\.([\w]){1,}$/gi);

                if (match) {
                    return match[0].replace('.', '').trim();
                }
                return '';
            }
        }
        catch (e) {
            console.log(href, "Can't find file type.");
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