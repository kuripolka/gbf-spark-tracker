export async function refreshData() {
    return await fetch("https://raw.githubusercontent.com/MizaGBF/GBFAL/refs/heads/main/json/data.json")
        .then(raw => raw.json())
        .then(json => {
            var characters = json["lookup"];
            var ssrs = Object.keys(characters)
                .filter(id => id.match(/^304\d+/))
                .map(id => ({[id]: characters[id]}));

            chrome.storage.local.set({
                weaponList: json["premium"],
                characterList: ssrs
            })
        });
}

export async function resetData() {
    return chrome.storage.local.set({
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
                spark: json,
                sparkTarget: { id: "3040585000", type: "new" },
                lastRoll: [],
                newWeapons: [],
                newCount: newCount,
                moonCount: moonCount,
                summonCount: summonCount
            });
        })
}