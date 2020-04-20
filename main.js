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

function randomDate(date1, date2) {
    function randomValueBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    date1 = date1 || '01-01-1970'
    date2 = date2 || new Date().toLocaleDateString()

    date1 = new Date(date1).getTime()
    date2 = new Date(date2).getTime()

    if (date1 > date2) {
        return new Date(randomValueBetween(date2, date1));
    } else {
        return new Date(randomValueBetween(date1, date2));
    }
}

function dateToString(date) {
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let day = date.getDate();
    if (day < 10) {
        day = "0" + day;
    }

    return "" + date.getFullYear() + month + day;
}

chrome.contextMenus.onClicked.addListener(function (itemData) {
    let date = randomDate("01-01-1970", "01-01-1998");
    let dobString = dateToString(date);
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