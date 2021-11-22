var ghostEmbedGenerator = () => {
    const htmlSnippetTypes = ['image', 'gallery', 'gallery-narrow', 'gallery-flowing', 'bookmark', 'video'];
    const objectFitCSS = ['fill', 'contain', 'cover', 'none', 'scale-down', 'inherit', 'initial', 'revert', 'unset'];
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
    let previewField = document.getElementById('html-preview')

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
        if (text === true) {
            return true;
        }
        if (text === false) {
            return false;
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
};

window.addEventListener('load', ghostEmbedGenerator);