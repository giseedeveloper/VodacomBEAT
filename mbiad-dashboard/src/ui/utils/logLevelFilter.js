const labelColors = [
    {"label": "ERR", "color": "#f5222d"},
    {"label": "ERROR", "color": "#f5222d"},

    {"label": "WARN", "color": "#f2bb05"},
    {"label": "WARNING", "color": "#f2bb05"},

    {"label": "INFO", "color": "#237804"},
    {"label": "INFORMATION", "color": "#237804"},

    {"label": "DEB", "color": "#1890FF"},
    {"label": "DEBUG", "color": "#1890FF"},
]


//Support different types of log label lettering
const errorLabels = ["ERR", "ERROR"]
const warningLabels = ["WARN", "WARNING"]
const infoLabels = ["INFO", "INFORMATION"]
const debugLabels = ["DEB", "DEBUG"]

/**
 * Create an array of log labels that support multiple log labeling
 * Example: for Warning and Info labels it will be ["INFO","INFORMATION","WARN","WARNING"]
 * @param labels
 * @returns {*[]}
 */
const joinComparableLabels = (labels) => {
    let searchableLabels = [];
    labels.forEach(label => {
        const lb = label.toUpperCase();
        if (lb === "ERROR") {
            searchableLabels = searchableLabels.concat(errorLabels)
        }
        if (lb === "WARNING" || lb === "WARN") {
            searchableLabels = searchableLabels.concat(warningLabels)
        }
        if (lb === "INFO") {
            searchableLabels = searchableLabels.concat(infoLabels)
        }
        if (lb === "DEBUG") {
            searchableLabels = searchableLabels.concat(debugLabels)
        }
    })
    return searchableLabels;
}

export function filterLogs(logsList, selectedLogLevels, searchTerm) {

    console.log(JSON.stringify(selectedLogLevels))
    const logLabels = joinComparableLabels(selectedLogLevels);
    console.log(JSON.stringify(logLabels))

    const filteredData = logsList.items.filter(logEntry => logEntry.fullContent.includes(searchTerm) && logLabels.includes(logEntry.logLevel.toUpperCase()))
    return {items: filteredData, itemsCount: filteredData.length}
}

export function getLogLabelColor(label) {
    const theLabel = label.toUpperCase();
    const matchedColorIndex = labelColors.findIndex((colorItem) => colorItem.label === theLabel)

    if (matchedColorIndex == null) {
        return "brown" //default color
    }
    return  labelColors[matchedColorIndex].color;
}