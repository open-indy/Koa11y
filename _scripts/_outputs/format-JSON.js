function formatJSON (imageStats, results) {
    var outputJSON = {};
    // Ensure that the imageStats Object is not empty
    if (!(Object.keys(imageStats).length === 0)) {
        outputJSON.images = imageStats;
    }
    outputJSON.results = results;
    outputJSON = JSON.stringify(outputJSON, null, 2);
    return outputJSON;
}

module.exports = formatJSON;
