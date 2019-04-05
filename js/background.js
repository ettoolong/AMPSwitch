let defaultPreference = {
  autoSwitch: 1,
  version: 1
};
let preferences = {};
let urlMapping = {};

const storageChangeHandler = (changes, area) => {
  if(area === 'local') {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
      preferences[item] = changes[item].newValue;
    }
  }
};

const loadPreference = () => {
  chrome.storage.local.get(results => {
    if ((typeof results.length === 'number') && (results.length > 0)) {
      results = results[0];
    }
    if (!results.version) {
      preferences = defaultPreference;
      chrome.storage.local.set(defaultPreference, res => {
        chrome.storage.onChanged.addListener(storageChangeHandler);
      });
    } else {
      preferences = results;
      chrome.storage.onChanged.addListener(storageChangeHandler);
    }
    if (preferences.version !== defaultPreference.version) {
      let update = {};
      let needUpdate = false;
      for(let p in defaultPreference) {
        if(preferences[p] === undefined) {
          update[p] = defaultPreference[p];
          needUpdate = true;
        }
      }
      if(needUpdate) {
        update.version = defaultPreference.version;
        chrome.storage.local.set(update);
      }
    }
  });
};

chrome.pageAction.onClicked.addListener(tab => {
  if (urlMapping[tab.id]) {
    urlMapping[tab.id].autoSwitch = false;
    chrome.tabs.update(tab.id, {url: urlMapping[tab.id].target});
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.url) {
    if (urlMapping[tabId]) {
      if (changeInfo.url !== urlMapping[tabId].source && changeInfo.url !== urlMapping[tabId].target) {
        chrome.pageAction.hide(tabId);
        delete urlMapping[tabId];
      }
    } else {
      chrome.pageAction.hide(tabId);
    }
  }
});

window.addEventListener('DOMContentLoaded', event => {
  loadPreference();
});

const messageHandler = (message, sender, sendResponse) => {
  const tab = sender.tab;
  if (message.supportAMP) {
    chrome.pageAction.show(tab.id);

    let ampInfo = {
      source: tab.url,
      target: message.isAMP ? message.canonicalUrl : message.ampUrl
    };

    if (urlMapping[tab.id]) {
      if ((tab.url === urlMapping[tab.id].source || tab.url == urlMapping[tab.id].target) && urlMapping[tab.id].autoSwitch === false) {
        ampInfo.autoSwitch = false;
      }
    }
    urlMapping[tab.id] = ampInfo;
    if (preferences.autoSwitch === 1 && !message.isAMP && urlMapping[tab.id].autoSwitch !== false && tab.url !== urlMapping[tab.id].target) {
      chrome.tabs.update(tab.id, {url: urlMapping[tab.id].target});
    }
  }
};

chrome.runtime.onMessage.addListener(messageHandler);
