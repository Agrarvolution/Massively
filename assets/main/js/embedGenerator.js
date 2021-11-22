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
    const buttonTypes = {html: 'html', json: 'json'};

    let htmlButton = document.getElementById('generate-html');
    let jsonButton = document.getElementById('generate-json');
    let clipboardButton = document.getElementById('copy-to-clipboard');
    let outputField = document.getElementById('output-space');
    let errorField = document.getElementById('generator-errors');
    let previewField = document.getElementById('html-preview');

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

            switch (type) {
                case buttonTypes.html: 
                    pickGenerator(data);
                    break;
                case buttonTypes.json:
                    outputField.value = JSON.stringify(data);
                    break;
                default:
                    break;
            }
            document.getElementById('generator-output').scrollIntoView({behavior: 'smooth'});
        } else {
            return false;
        }
    }

    function pickGenerator(data) {
        let generatedHTML = '';
        switch(data.snippet) {
            case 'image':
            case 'gallery':
            case 'gallery-narrow':
            case 'gallery-flowing':
            case 'bookmark':
            case 'video':
                break;
            default:
                writeError ('No matching generator found.');
                break;
        }
        outputField.value = generatedHTML;
        // change if better solution found
        previewField.innerHTML = generatedHTML;
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
    const fallbackImageType = [
    'svg', 'jpeg', 'jpg', 'png', 'gif'
    ];
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
        



    // HTML Generation - sub element generation
    // -----------------------------------------------------------------------------------------  
    /**
     * Generates a sngle image block
     * @param {*} data from form validation
     * @param {*} index index from Link list
     * @param {*} type media type -> image, video
     * @returns DOM Object
     */ 
    function generateImage (data, index, type) {
        let isGhostLink = isGhostLink(data.mediaLinks[index]?.link);
		let fileType = getFileType(data.mediaLinks[index].link);
        let fallbacks = [];
		let srcset = '';
        let sizes = '';
        let mediaElement = {};
        let alt = cleanAttr(data.caption) || '';
        let videoAttr = '';

        //Handle responsiveness
        if (data.mediaLinks?.[index].link && isGhostLink && data.isResponsive && type === mediaTypes.image) {   
            srcset = generateSrcSet(data.mediaLinks?.[index].link, data.snippet);
        }

        if (data.sizes !== '' && type === mediaTypes.image) {
            sizes = data.sizes;
        } else if (data.isResponsive && type === mediaTypes.image) {
            sizes = imageSizes[data.snippet];
        }

        //Handle fallsbacks
        for (let fallback in data.mediaLinks?.[index].fallback) {
            let tempFallback = {};

            if (fallback.link && type === mediaTypes.image) {
                tempFallback.link = fallback.link;

                if (fallback.srcset) {
                    tempFallback.srcset = fallback.srcset;
                } else if (isGhostLink(fallback.link)) {
                    tempFallback.srcset = generateSrcSet(fallback.link, data.snippet);
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
        if (data.mediaLinks?.[index].fallback) {
            let tempFallback = {};
            tempFallback.link = data.mediaLinks?.[index].link || '';

            if (fileType !== 'svg' && type === mediaTypes.image) {
                tempFallback.srcset = srcset;
                tempFallback.sizes = sizes;
            } else {
                tempFallback.srcset = '';
                tempFallback.sizes = '';
            }
            fallbacks.push(tempFallback);
        }
        if (isGhostLink && !data.mediaLinks?.[index].fallback) {     
            let fallbacks = [fileType]
            for (let fallbackType in data.fallbackTypes) {
                if (!fallbacks.includes(fallbackType[fileType])) {
                    fallbacks.push(fallbackType[fileType]);
                }
            }
            
            for (let fallbackType in fallbacks) {
                let tempFallback = {};
                tempFallback.link = data.mediaLinks[index].link.replaceAll(fileType, fallbackType);

                if (fallbackType !== 'svg' && type === mediaTypes.image) {
                    tempFallback.srcset = srcset.replaceAll(fileType, fallbackType);
                    tempFallback.sizes = sizes;
                } else {
                    tempFallback.srcset = '';
                    tempFallback.sizes = '';
                }
                
                tempFallback.fileType = fallbackType;

                fallbacks.push(tempFallback);
            }
        }

        // Create export element
        if (type === mediaTypes.image) {
            if (fallbacks.length > 1) {
                let picture = document.createElement('picture');
                picture.classList.add('kg-image');

                for (let i = 0; i < fallbacks.length; i++) {
                    if (i+1 === fallbacks.length) {
                        picture.appendChild(createImgElement(fallbacks[i].link, 
                                                            fallbacks[i].srcset, 
                                                            fallbacks[i].sizes, 
                                                            alt));
                    } else {
                        picture.appendChild(createSourceElement(fallbacks[i].link, 
                                                            fallbacks[i].srcset, 
                                                            fallbacks[i].fileType, 
                                                            fallbacks[i].sizes, 
                                                            mediaTypes.image));
                    }
                }
            } else if (fallbacks.length > 0) {
                mediaElement = createImgElement(fallbacks[0].link, fallbacks[0].srcset, fallbacks[0].sizes, alt);
            } else {
                mediaElement = createImgElement('', srcset, sizes, alt);
            }
        } else if (type === mediaTypes.video) {
            let video = document.createElement('video');
            video.autoplay = data.mediaLinks[index].autoplay || true;
            video.loop = data.mediaLinks[index].autoplay || true;
            video.muted = data.mediaLinks[index].muted || true;
            video.controls = data.mediaLinks[index].controls || false;
            video.poster = data.mediaLinks[index].poster || '';
            video.poster = data.mediaLinks[index].preload || preloadHTML[0];

            for (let fallback in fallbacks) {
                video.appendChild(createSourceElement(fallback.link, 
                                                    '', 
                                                    fallback.fileType, 
                                                    '', 
                                                    mediaTypes.video));
            }
            mediaElement = video;
        }
        

		return mediaElement;
	}

    function createSourceElement (src, srcset, fileType, media, mediaType) {
        let source = Object.assign(document.createElement('source'), {
            src: src,
            srcset: srcset,
            type: mimeTypes[fileType] || '',
            media: media
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
	function createImgElement (src, srcset, sizes, alt) {
        if (isGhostLink(src)) {
			src = createSubLink(src, '');
		}
        let img = Object.assign(document.createElement('img'), {
            src: src,
            srcset: srcset,
            sizes: sizes,
            alt: alt
        });
        img.classList.add('kg-image');
        return img;
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
    function createSubLink (href, size) {
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
			href = href.replace('/images/','/images/size' + size);
		}
		return href;
	}

    // Form validation
    // -----------------------------------------------------------------------------------------
    function validateForm () {
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
    function processForm () {
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
                    data.classes = cleanAttr(settings.classes);
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
            data.classes = cleanAttr(classes);
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

        return data;
    }
    function writeError (error) {
        errorField.innerText =  `An error occured: ${error}`;
    }
    // Form validation helper functions
    // -----------------------------------------------------------------------------------------
    function parseCustomWidth (widthArr) {
        let width = [];
        for (let i = 0; i < widthArr.length; i++) {
            if (widthArr[i].matches(/^\d+$/g)) {
                width.push(widthArr[i]);
            }
        }
        return width;
    }

    function parseLinks (linkList) {
        let links = [];

        if (linkList.length && typeof linkList[0] === 'string') {
            for (let i = 0; i < linkList.length; i++) {
                links.push({link: linkList[i].replaceAll('"', '').trim()});
            }
        } else {
            for (let i = 0; i < linkList.length; i++) {
                let tempLink = {}
                if (linkList[i].link) {
                    tempLink.link = linkList.link.replaceAll('"', '').trim();
                }
                if (linkList[i].metadata) {
                    tempLink.metadata = {};
                    
                    if (linkList[i].metadata['aspect-ratio'] !== '' && 
                        linkList[i].metadata['aspect-ratio'].match(/^\d+\/\d+$/)) {
                            tempLink.metadata.aspectRatio = linkList[i].metadata['aspect-ratio'];
                    }

                    if (linkList[i].metadata['object-fit'] !== '' && 
                        objectFitCSS.includes(linkList[i].metadata['object-fit'])) {
                            tempLink.metadata.objectFit = cleanAttr(linkList[i].metadata['object-fit']);
                    }

                    if (linkList[i].metadata['object-position'] !== '') {
                        tempLink.metadata.objectPosition = cleanAttr(linkList[i].metadata['object-position']);
                    }

                    if (linkList[i].metadata['target-href'] !== '') {
                        tempLink.metadata.href = cleanAttr(linkList[i].metadata['target-href']);
                    }

                    if (linkList[i].metadata['open-as-new'] !== '') {
                        tempLink.metadata.openAsNew = linkList[i].metadata['open-as-new'] === true ? true : false; 
                    } 

                    if (linkList[i].metadata['srcset'] !== '') {
                        tempLink.metadata.srcset = cleanAttr(linkList[i].metadata['srcset']);
                    }

                    if (linkList[i].metadata['loop'] !== '') {
                        tempLink.metadata.loop = convertTextToBool(linkList[i].metadata['loop']);
                    }
                    if (linkList[i].metadata['autoplay'] !== '') {
                        tempLink.metadata.autoplay = convertTextToBool(linkList[i].metadata['autoplay']);
                    }
                    if (linkList[i].metadata['muted'] !== '') {
                        tempLink.metadata.muted = convertTextToBool(linkList[i].metadata['muted']);
                    }
                    if (linkList[i].metadata['controls'] !== '') {
                        tempLink.metadata.controls = convertTextToBool(linkList[i].metadata['controls']);
                    }
                    if (preloadHTML.includes(linkList[i].metadata['preload'])) {
                        tempLink.metadata.preload = linkList[i].metadata['preload'];
                    }
                    if (linkList[i].metadata['poster'] !== '') {
                        tempLink.metadata.poster = cleanAttr(linkList[i].metadata['poster']);
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
                links.push(tempLink);
            }
        }
        return links;
    }



    // General helper functions
    // -----------------------------------------------------------------------------------------

    function convertTextToBool (text) {
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
    function getFileType (href) {
        try {
			if (href !== undefined || href !== '') {
				var match =  new URL(href).pathname.match(/\.([\w]){1,}$/gi);

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
        defaultImageLink;
		if (href && typeof href === 'string' && href.matches(defaultImageLink)) {
            return true;
		}
		return false;
	}
};

window.addEventListener('load', ghostEmbedGenerator);