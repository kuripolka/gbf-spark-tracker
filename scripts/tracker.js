chrome.runtime.onMessage.addListener(() => {
    var isGacha, isSparkSelect;

    // gacha html elements arent immediately loaded, need to check until present
    var check = setInterval(() => {
        isGacha = document.getElementsByClassName("prt-gacha-result").length > 0;
        isSparkSelect = document.querySelector('div[data-css="/gacha/ceiling.css"]') != null;

        if (isGacha || isSparkSelect) {
            clearInterval(check);
            if (isGacha) {
                // update rolls + scam guarantee
                updateSpark();
            }

            if (isSparkSelect) {
                // pick spark target
                document.querySelectorAll('.btn-exchange, .prt-exchange-ng')
                    .forEach(button => button.addEventListener('click', e => updateSparkTarget(e)));

                // fetch gacha details + update spark for new weapons not in data.json yet
                updateWeaponList();
            }
        }
    }, 500)
})

function updateSpark() {
    getGachaResults(ssrs => {
        if (ssrs.length > 0) {
            chrome.storage.local.get(["weaponList", "newWeapons", "spark", "newCount", "moonCount", "summonCount"])
                .then(tracker => {
                    ssrs.forEach(ssrId => updateTracker(tracker, ssrId));
                    chrome.storage.local.set(tracker);
                })
        }
    });
}

function getGachaResults(callback) {
    chrome.storage.local.get("lastRoll").then(tracker => {
        var results = document.querySelectorAll(".lis-result-multi.se, .prt-obtain-image");
        var ids = Array.from(results).map(result => result.children[0].alt);

        // do not update tracker if page has been refreshed
        if (isSameResults(tracker.lastRoll, ids)) {
            callback([]);
        } else {
            tracker.lastRoll = ids;
            chrome.storage.local.set(tracker);
    
            var ssrRegex = /^\d\d4\d+/;
            callback(Array.from(results).filter(result => result.children[0].alt.match(ssrRegex)));
        }
    })
}

function isSameResults(last, current) {
    if (last.length != current.length) return false;
    return last.every((r, i) => r == current[i]);
}

function updateTracker(tracker, ssr) {
    var ssrId = ssr.children[0].alt;

    var type;
    if (ssrId.match(/^2\d+/)) {
        type = "summon";
        tracker.summonCount += 1;
    } else {
        // if (!tracker.weaponList[ssrId]) {
        //     ssrId = tracker.weaponList[ssrId]
        // } else if (tracker.newWeapons.indexOf(ssrId) == -1) {
        //     // ssr list source is not automatically updated upon gbf update, need to keep track of new ssrs
        //     tracker.newWeapons.push(ssrId);
        // }
        
        if (ssr.children.length == 1 || ssr.children[1].classList.value != "ico-new") {
            type = "moon"
            tracker.moonCount += 1;
        } else {
            type = "new"
            tracker.newCount += 1;
        }
    }

    tracker.spark.push({
        id: ssrId,
        type: type
    })
}

function updateWeaponList() {
    var sparkTargets = document.querySelectorAll('.lis-item-open');
    for (var sparkTarget of sparkTargets) {
        var weapon = getWeaponDetails(sparkTarget);
        weaponList[weapon.id] = weapon.charaId;
    };

    chrome.storage.local.set({
        weaponList: weaponList
    });
}

function getWeaponDetails(weaponDiv) {
    while (weaponDiv.classList[0] != "lis-item-open") {
        weaponDiv = weaponDiv.parentElement;
    }

    var weaponId = document.querySelector('.lis-item-open').children[1].attributes['data-item-id'].value;
    var newCharaImg = weaponDiv.children[3].children[0].src
    var regex = /\/assets\/npc\/s\/(.*)_01\.jpg/;
    return {
        id: weaponId,
        charaId: regex.exec(newCharaImg)[1],
        type: weaponDiv.classList.length == 3 ? "moon" : "new"
    };
}

function updateSparkTarget(event) {
    chrome.storage.local.set({
        sparkTarget: getWeaponDetails(event.target)
    });
}