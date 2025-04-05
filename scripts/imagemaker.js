var tableWidth = 1100;
var tableHeight;
var tableMargin = 10;
var tablePadding = 20;
var tablePaddingBottom = 80;
var headerSize = 80;
var headerBottomPadding = 15;
var ssrWidth = 140;
var ssrHeight = 80;
var sparkWidth = 45;
var ssrPadding = 2;
var borderMargin = 11;
var borderRadii = 20;
var loadedImages = [];

export function create(tracker) {
    var ssrCount = tracker.newCount + tracker.moonCount + tracker.summonCount;
    if (tracker.sparkTarget) {
        tracker.spark.push({...tracker.sparkTarget, isSparkTarget: true});
    }

    var table = createSparkTable();
    tableHeight = calculateHeight(tracker);

    appendSsrImages(table, tracker);
    applyCss(table);

    var parentDiv = document.createElement('div');
    parentDiv.appendChild(table);
    parentDiv.appendChild(createBackground(ssrCount));  // border + ssr rate

    displaySpark(parentDiv);
}

function createSparkTable() {
    var table = document.createElement('table');

    var headers = table.insertRow();
    headers.id = 'headers';
    appendHeaderImage(headers, 'gem');
    appendHeaderImage(headers, 'moon');
    appendHeaderImage(headers, 'sunstone');

    var ssrs = table.insertRow(),
        newSsrs = ssrs.insertCell(),
        moons = ssrs.insertCell(),
        summons = ssrs.insertCell();

    newSsrs.id = 'new';
    newSsrs.classList.add('category');

    moons.id = 'moon';
    moons.classList.add('category');

    summons.id = 'summon';
    summons.classList.add('category');

    return table;
}

function calculateHeight(tracker) {
    if (tracker.sparkTarget) {
        var sparkTargetType = tracker.sparkTarget.type;
        ++tracker[sparkTargetType + 'Count'];
    }

    var newCount = tracker.newCount;
    var moonCount = tracker.moonCount;
    var summonCount = tracker.summonCount;

    var newSsrRows = getRows(newCount);
    var moonSsrRows = getRows(moonCount);
    var summonSsrRows = getRows(summonCount);

    var maxRowsHeight = Math.max(newSsrRows.height, moonSsrRows.height, summonSsrRows.height);
    var maxRowCount = Math.max(newSsrRows.count, moonSsrRows.count, summonSsrRows.count);

    return tableMargin + tablePadding 
            + headerSize + headerBottomPadding
            + maxRowsHeight
            + (ssrPadding * 2)    // *2 bc both top and bottom of img
            + 2 + (2 * maxRowCount) // table cell borders (2 (header) + 2*maxRows (ssr))
            + tablePaddingBottom;
}

function getColumnSize(count) {
    var columns = 1;
    var init = 6;

    while (init < count) {
        columns++;
        init += 10;
    }

    return columns;
}

function getRows(count) {
    var columnSize = getColumnSize(count);
    var rowHeight = ssrHeight * getSsrRatio(count);
    var rows = Math.ceil(count / columnSize);

    return {
        count: rows,
        height: rows * rowHeight
    };
}

function getSsrRatio(count) {
    return getSsrWidth(count)/ssrWidth;
}

function getSsrWidth(count) {
    var columnSize = getColumnSize(count);
    return columnSize <= 2
        ? ssrWidth
        : (ssrWidth*2) / columnSize;
}

function appendHeaderImage(headers, file) {
    var header = headers.insertCell();
    header.classList.add('header');

    var img = new Image();
    img.src = "https://mizagbf.github.io/GBFAL/assets/spark/" + file + ".jpg";
    img.width = headerSize;
    img.height = headerSize;
    img.alt = file;
    addLoadedImage(img);
    
    header.appendChild(img);
}

function addLoadedImage(img) {
    loadedImages.push(new Promise(resolve => {
        img.onload = () => resolve();
    }));
}

function getImg(ssr, isSparkTarget, totalCount) {
    var id = ssr.id;
    var characterUrl = `https://prd-game-a4-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/${id}_01.jpg`;
    var summonUrl = `https://prd-game-a2-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/summon/m/${id}.jpg`;

    var img = new Image();
    img.classList.add('ssr');
    img.src = id.match(/^3\d+/) ? characterUrl : summonUrl;
    img.alt = id;
    img.width = getSsrWidth(totalCount);
    addLoadedImage(img);

    var div = document.createElement("div");
    div.classList.add('ssrDiv');
    div.appendChild(img);

    if (isSparkTarget) {
        var spark = new Image();
        spark.classList.add('sparkTarget');
        spark.src = "https://mizagbf.github.io/GBFAL/assets/spark/spark.png";
        spark.alt = "spark"
        spark.width = sparkWidth * getSsrRatio(totalCount);
        addLoadedImage(spark);
        div.appendChild(spark);
    }
    
    return div;
}

function appendSsrImages(table, tracker) {
    var newDiv = document.createElement('div');
    var moonDiv = document.createElement('div');
    var summonDiv = document.createElement('div');
    var addedNewCount = 0;
    var addedMoonCount = 0;
    var addedSummonCount = 0;

    tracker.spark.forEach(ssr => {
        var isSparkTarget = ssr.isSparkTarget;
        if (ssr.type == 'new') {
            newDiv.appendChild(getImg(ssr, isSparkTarget, tracker.newCount));
            newDiv = processFullRow(table, newDiv, ssr.type, ++addedNewCount, tracker.newCount);
        } else if (ssr.type == 'moon') {
            moonDiv.appendChild(getImg(ssr, isSparkTarget, tracker.moonCount));
            moonDiv = processFullRow(table, moonDiv, ssr.type, ++addedMoonCount, tracker.moonCount);
        } else {
            summonDiv.appendChild(getImg(ssr, isSparkTarget, tracker.summonCount));
            summonDiv = processFullRow(table, summonDiv, ssr.type, ++addedSummonCount, tracker.summonCount);
        }
    });
}

function processFullRow(table, div, id, currentCount, totalCount) {
    if (currentCount >= totalCount
            || div.children.length == getColumnSize(totalCount)) {
        table.querySelector("#" + id).appendChild(div);
        return document.createElement('div');
    }

    return div;
}

function applyCss(table) {
    table.style = `position: absolute; border-spacing:0px; table-layout: fixed; background-color: #16181a;`
                    + `margin:${tableMargin}px; padding:${tablePadding}px ${tablePadding}px ${tablePaddingBottom}px ${tablePadding}px;`
                    + `width:${tableWidth}px; height:${tableHeight}px`;
    table.querySelectorAll('.header').forEach(e => e.style = `padding-bottom:${headerBottomPadding}px`)
    table.querySelectorAll('.ssrDiv').forEach(e => e.style = `display:inline-block; position:relative`);
    table.querySelectorAll('.ssr').forEach(e => e.style = `padding:${ssrPadding}px`);
    table.querySelectorAll('.sparkTarget').forEach(e => e.style = `padding:${ssrPadding}px; position:absolute; left:0px`);
    table.querySelectorAll('td').forEach(e => {
        e.style.verticalAlign = 'top';
        e.style.textAlign = 'center';
    });
}

function createBackground(ssrCount) {
    var borderWidth = tableWidth - (2*borderMargin);
    var borderHeight = tableHeight - (2*borderMargin);

    var svg = document.createElement('svg');
    svg.setAttribute("width", borderWidth);
    svg.setAttribute("height", borderHeight);
    svg.style = `position:absolute; margin:${tableMargin+borderMargin}px`;

    var border = document.createElement('rect');
    border.setAttribute("width", borderWidth);
    border.setAttribute("height", borderHeight);
    border.style = `rx:${borderRadii}; ry:${borderRadii}; stroke-width:2; stroke:white; fill-opacity:0`;
    svg.appendChild(border);

    var ssrRateBoxWidth = 280;
    var ssrRateBoxHeight = 35;
    var ssrRateBoxX = borderWidth - ssrRateBoxWidth;
    var ssrRateBoxY = borderHeight - ssrRateBoxHeight;
    var ssrRateBox = document.createElement('path');
    ssrRateBox.setAttribute("d", `M ${ssrRateBoxX} ${borderHeight}`
                                + `L ${ssrRateBoxX} ${ssrRateBoxY+borderRadii}`
                                + `Q ${ssrRateBoxX} ${ssrRateBoxY} ${ssrRateBoxX+borderRadii} ${ssrRateBoxY}`
                                + `L ${borderWidth} ${ssrRateBoxY}`
                                + `L ${borderWidth} ${borderHeight-borderRadii}`
                                + `Q ${borderWidth} ${borderHeight} ${borderWidth-borderRadii} ${borderHeight}`
                                + `Z`);
    ssrRateBox.style = `fill:white; fill-opacity:0.7`;
    svg.appendChild(ssrRateBox);

    var ssrRate = document.createElement('text');
    ssrRate.setAttribute('x', ssrRateBoxX + 18);    // +padding
    ssrRate.setAttribute('y', borderHeight - ((borderHeight - ssrRateBoxY) / 3));   // set text to middle of box
    ssrRate.innerHTML = `SSR Rate: ${ssrCount}/300 (${(ssrCount/3).toFixed(2)}%)`;
    ssrRate.style = `font-family:Georgia; font-size:20`;
    svg.appendChild(ssrRate);
    return svg;
}

function displaySpark(table) {
    var blob = new Blob([table.outerHTML], { type: "text/html" });
    var blobUrl = URL.createObjectURL(blob);

    Promise.all(loadedImages)
        .then(() => chrome.tabs.create({url: blobUrl}));
}