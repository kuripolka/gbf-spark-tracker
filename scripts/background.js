import * as common from "./common.js";

chrome.runtime.onInstalled.addListener(details => {
    chrome.storage.local.clear();

    common.refreshData();
    common.resetData();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log("in onUpdated!")
    if (changeInfo.status == "complete" 
            && (tab.url.startsWith("https://game.granbluefantasy.jp/#gacha/result") 
                || tab.url.startsWith("https://game.granbluefantasy.jp/#gacha/ceiling") 
                || tab.url.startsWith("http://localhost:8080/"))) {
        chrome.tabs.sendMessage(tabId, {});
    }
});