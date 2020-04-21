chrome.runtime.onInstalled.addListener(function () {
    // When the app gets installed, set up the context menus
    let mainId = chrome.contextMenus.create({
        title: 'Add SA ID number',
        type: 'normal',
        id: 'root',
        contexts: ['editable']
    });

    chrome.contextMenus.create({
        title: 'Male',
        type: 'normal',
        id: 'male-id',
        parentId: mainId,
        contexts: ['editable']
    });

    chrome.contextMenus.create({
        title: 'Female',
        type: 'normal',
        id: 'female-id',
        parentId: mainId,
        contexts: ['editable']
    });
});

chrome.contextMenus.onClicked.addListener(function (itemData) {
    let date = randomDate("01-01-1970", "01-01-1998");
    let dob = dateToUnformattedString(date);
    let dobString = dob.substring(dob.length - 6);
    if (itemData.menuItemId === "male-id") {
        let id = generateID(dobString, true, true);
        sendMessage('id', id);
    } else if (itemData.menuItemId === "female-id") {
        let id = generateID(dobString, false, true);
        sendMessage('id', id);
    }
});

function sendMessage(type, message) {
    message.type = type;
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}