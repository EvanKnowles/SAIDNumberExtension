// MV3 background service worker. `jSAID.js` provides generateID / randomDate /
// dateToUnformattedString; it has no DOM or MV2/MV3-specific APIs so it loads fine here.
importScripts('jSAID.js');

chrome.runtime.onInstalled.addListener(function () {
    // When the app gets installed, set up the context menus
    chrome.contextMenus.create({
        title: 'Add SA ID number',
        type: 'normal',
        id: 'root',
        contexts: ['editable']
    });

    chrome.contextMenus.create({
        title: 'Male',
        type: 'normal',
        id: 'male-id',
        parentId: 'root',
        contexts: ['editable']
    });

    chrome.contextMenus.create({
        title: 'Female',
        type: 'normal',
        id: 'female-id',
        parentId: 'root',
        contexts: ['editable']
    });
});

// Runs in the page (isolated world) via chrome.scripting - no closure references allowed.
function insertGeneratedId(value) {
    const el = document.activeElement;
    if (!el) {
        return;
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = value;
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
    } else if (el.isContentEditable) {
        el.textContent = value;
        el.dispatchEvent(new Event('input', {bubbles: true}));
    }
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId !== 'male-id' && info.menuItemId !== 'female-id') {
        return;
    }
    if (!tab || tab.id == null) {
        return;
    }

    const date = randomDate("01-01-1970", "01-01-1998");
    const dob = dateToUnformattedString(date);
    const dobString = dob.substring(dob.length - 6);
    const male = info.menuItemId === 'male-id';

    const id = generateID(dobString, male, true);

    // Inject straight into the frame that was right-clicked. `activeTab` covers this
    // because a context-menu click is a user gesture, so no broad host permission or
    // always-on content script is needed.
    chrome.scripting.executeScript({
        target: {tabId: tab.id, frameIds: [info.frameId || 0]},
        func: insertGeneratedId,
        args: [id]
    }).catch(function (err) {
        console.error('SA ID Tools: could not insert into the page.', err);
    });
});
