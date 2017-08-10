function formatCSV (imageStats, results) {
    // Ensure that the imageStats Object is not empty
    if (!(Object.keys(imageStats).length === 0 && imageStats.constructor === Object)) {
        // TODO: I don't know how to structure the data for CSV so that it can also contain ImgAlts data
        console.log(window.imageStats); // eslint-disable-line no-console
    }

    var json2csv = require('json2csv');
    var fields = [];

    for (var key in results[0]) {
        fields.push(key);
    }

    var outputCSV = json2csv({
        'data': results,
        'fields': fields
    });

    return outputCSV;
}

module.exports = formatCSV;
