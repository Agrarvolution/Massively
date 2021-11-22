var ghostEmbedGenerator = () => {
    const htmlSnippetTypes = ['image', 'gallery-image', 'gallery-narrow', 'gallery-flowing', 'bookmark', 'video'];
    const objectFitCSS = ['fill', 'contain', 'cover', 'none', 'scale-down', 'inherit', 'initial', 'revert', 'unset'];
    const formElementID = {
        snippet: 0,
        links: 1,
        fallback: 2,
        classes: 3,
        caption: 4,
        link: 5,
        settings: 6
    }

    let htmlButton = document.getElementById('generate-html');
    let jsonButtom = document.getElementById('generate-json');

    htmlButton.addEventListener('click', event => {
        event.preventDefault();
        console.log(validateForm());
        if (validateForm()) {
            processForm();
        } else {
            return false;
        }
    });


    // Form validation
    // -----------------------------------------------------------------------------------------
    function validateForm () {
        if (document.forms[0]) {
            //Check snippet selection
            if (!htmlSnippetTypes.includes(document.forms[0][formElementID.snippet].value)) {
                return false;
            }
            //Check if JSON
            let links = document.forms[0][formElementID.links].value;
            if (links === '') {
                return false;
            }
            try {
                console.log(links);
                JSON.parse(links);
            } catch (e) {
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

        if (settings !== '') {
            try {
                settings = JSON.parse(settings);
                if (htmlSnippetTypes.includes(settings.snippet)) {
                    data.snippet = settings.snippet;
                }

                if (settings.mediaLinks && settings.mediaLinks.length) {
                    data.mediaLinks = parseLinks(settings.mediaLinks);
                }

                if (settings.fallbackTypes.length) {
                    data.fallbackTypes = settings.fallbackTypes;
                }

                if (settings.classes) {
                    data.classes = settings.classes;
                }
                if (settings.caption) {
                    data.caption = settings.caption;
                }
                if (settings.link) {
                    data.link = settings.link; 
                }
                

            } catch (e) {
                console.log(e);
            }
        }

        if (!data.snippet) {
            data.snippet = document.forms[0][formElementID.snippet].value;
        }

        
        try {
            if (linkList !== '') {
                linkList = JSON.parse(linkList);
                data.mediaLinks = parseLinks(linkList);
            }
        } catch (e) {
            console.log(e)
        }

        
        try {
            if (fallbackTypes !== '') {
                fallbackTypes = JSON.parse(fallbackTypes);
                if (fallbackTypes.length) {
                    data.fallbackTypes = fallbackTypes;
                }
            }          
        } catch (e) {
            console.log(e);
        }

        if (classes !== '') {
            data.classes = classes;
        }
        if (caption !== '') {
            data.caption = caption;
        }
        if (wrapperLink !== '') {
            data.link = wrapperLink;
        }
        console.log(data)
        return data;
    }

    // Form validation helper functions
    // -----------------------------------------------------------------------------------------
    function parseLinks (linkList) {
        let links = [];

        if (linkList.length && typeof linkList[0] === 'string') {
            for (let i = 0; i < linkList.length; i++) {
                links.push({link: linkList[i]});
            }
        } else {
            for (let i = 0; i < linkList.length; i++) {
                let tempLink = {}
                if (linkList[i].link) {
                    tempLink.link = linkList.link;
                }
                if (linkList[i].metadata) {
                    tempLink.metadata = {};
                    
                    if (linkList[i].metadata['aspect-ratio'] !== '' && 
                        linkList[i].metadata['aspect-ratio'].match(/^\d+\/\d+$/)) {
                            tempLink.metadata.aspectRatio = linkList[i].metadata['aspect-ratio'];
                    }

                    if (linkList[i].metadata['object-fit'] !== '' && 
                        objectFitCSS.includes(linkList[i].metadata['object-fit'])) {
                            tempLink.metadata.objectFit = linkList[i].metadata['object-fit'];
                    }

                    if (linkList[i].metadata['object-position'] !== '') {
                        tempLink.metadata.objectPosition = linkList[i].metadata['object-position'];
                    }

                    if (linkList[i].metadata['target-href'] !== '') {
                        tempLink.metadata.href = linkList[i].metadata['target-href'];
                    }
                }
                links.push(tempLink);
            }
        }
        return links;
    }



    // General helper functions
    // -----------------------------------------------------------------------------------------

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
};

window.addEventListener('load', ghostEmbedGenerator);