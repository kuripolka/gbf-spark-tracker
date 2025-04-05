import * as common from "./common.js";
import * as image from "./imagemaker.js";

document.addEventListener('DOMContentLoaded', function () {
    displayCount();

    document.getElementById("reset").addEventListener("click", () => {
        common.resetData().then(() => displayCount());
    })

    document.getElementById("send").addEventListener("click", () => {
        chrome.storage.local.get(["weaponList", "spark", "sparkTarget", "newCount", "moonCount", "summonCount"])
            .then(tracker => {
                if (tracker.newCount == 0 && tracker.moonCount == 0 && tracker.summonCount == 0) {
                    alert("No SSRs yet!")
                } else {
                    image.create(tracker);
                }
            });
    })
})

function displayCount() {
    chrome.storage.local.get(["newCount", "moonCount", "summonCount"]).then(tracker => {
        document.getElementById("newCount").innerHTML = tracker.newCount;
        document.getElementById("moonCount").innerHTML = tracker.moonCount;
        document.getElementById("summonCount").innerHTML = tracker.summonCount;
    });
}
