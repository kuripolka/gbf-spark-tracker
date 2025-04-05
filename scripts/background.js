import * as common from "./common.js";

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.clear();
    common.resetData();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == "complete" 
            && (tab.url.startsWith("https://game.granbluefantasy.jp/#gacha/result") 
                || tab.url.startsWith("https://game.granbluefantasy.jp/#gacha/ceiling"))) {
        chrome.tabs.sendMessage(tabId, {});
    }
});