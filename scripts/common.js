export async function resetData() {
    return chrome.storage.local.set({
        weaponList: {},
        spark: [],
        sparkTarget: "",
        lastRoll: [],
        newWeapons: [],
        newCount: 0,
        moonCount: 0,
        summonCount: 0
    });
}

// for testing only
function getSparkData(file) {
    fetch(`../test-data/${file}.json`)
        .then(raw => raw.json())
        .then(json => {
            var newCount = 0;
            var moonCount = 0;
            var summonCount = 0;

            json.forEach(ssr => {
                if (ssr.id.match(/^204/)) {
                    summonCount++;
                } else if (ssr.type == "new") {
                    newCount++;
                } else {
                    moonCount++;
                }
            })

            chrome.storage.local.set({
                weaponList: {},
                spark: json,
                sparkTarget: { id: "1040714000", type: "new" },
                lastRoll: [],
                newWeapons: [],
                newCount: newCount,
                moonCount: moonCount,
                summonCount: summonCount
            });
        })
}