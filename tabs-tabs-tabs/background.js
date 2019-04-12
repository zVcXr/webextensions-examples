let tabHistory=[]; // At the top of background.js
browser.tabs.onCreated.addListener(handleCreated); // Somewhere in background.js
browser.tabs.onUpdated.addListener(handleUpdated);
browser.tabs.onRemoved.addListener(handleRemoved);

function handleCreated(tab) {
     let tabId = tab.id;
     if(tabHistory[tabId]==null) tabHistory[tabId] = [];
     tabHistory[tabId].push(tab.url);
}

function handleUpdated(tabId, changeInfo, tab) {
    if (changeInfo.url) {
	if(tabHistory[tabId]==null) tabHistory[tabId] = [];
	tabHistory[tabId].push(changeInfo.url);
    }
}

function handleRemoved(tabId) {
    delete tabHistory[tabId];
}

function getHistoryForTab(tabId) {
    if (tabHistory[tabId]) {
	for(let url of tabHistory[tabId]){
	    console.log(url);
	}
    }
}

browser.runtime.onMessage.addListener(onMessage);

function onMessage(message) {
    window[message.method].apply(this, message.arguments);
}

function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
  .then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    browser.browserAction.setBadgeText({text: length.toString()});
    if (length > 2) {
      browser.browserAction.setBadgeBackgroundColor({'color': 'green'});
    } else {
      browser.browserAction.setBadgeBackgroundColor({'color': 'red'});
    }
  });
}


browser.tabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
browser.tabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});
updateCount();
