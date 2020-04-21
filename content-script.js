const getActiveElement = function (document) {
    document = document || window.document;

    // Check if the active element is in the main web or iframe
    if (document.body === document.activeElement
        || document.activeElement.tagName == 'IFRAME') {
        // Get iframes
        const iframes = document.getElementsByTagName('iframe');
        for (let i = 0; i < iframes.length; i++) {
            // Recall
            const focused = getActiveElement(iframes[i].contentWindow.document);
            if (focused !== false) {
                return focused; // The focused
            }
        }
    } else return document.activeElement;

    return false;
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        getActiveElement().value = request;
    });