function formatXML (imageStats, results) {
    var outputXML = '<?xml version="1.0" encoding="UTF-8"?>\n<pa11y>\n';

    var imgAlts = '';
    // Ensure that the imageStats Object is not empty
    if (!(Object.keys(imageStats).length === 0 && imageStats.constructor === Object)) {
        imgAlts =
            '  <imagealts>\n' +
            '    <totalimages>' + imageStats.totalImages + '</totalimages>\n' +
            '    <descriptive>' + imageStats.descriptive + '</descriptive>\n' +
            '    <nondescriptive>' + imageStats.nondescriptive + '</nondescriptive>\n' +
            '    <under100char>' + imageStats.under100Char + '</under100char>\n' +
            '    <under100kb>' + imageStats.under100KB + '</under100kb>\n' +
            '    <imagesloaded>' + imageStats.imagesLoaded + '</imagesloaded>\n' +
            '    <totalfilesizeinbytes>' + imageStats.totalFileSizeInBytes + '</totalfilesizeinbytes>\n' +
            '    <totalfilesizeinkb>' + imageStats.totalFileSizeInKB + '</totalfilesizeinkb>\n' +
            '    <descriptivepercent>' + imageStats.descriptivePercent + '</descriptivepercent>\n' +
            '    <under100charpercent>' + imageStats.under100CharPercent + '</under100charpercent>\n' +
            '    <under100kbpercent>' + imageStats.under100KBPercent + '</under100kbpercent>\n' +
            '    <imagesloadedpercent>' + imageStats.imagesLoadedPercent + '</imagesloadedpercent>\n' +
            '  </imagealts>\n';
    }

    outputXML = outputXML + imgAlts;

    for (var i = 0; i < results.length; i++) {
        var current = results[i];
        var result =
            '  <result>\n' +
            '    <code>' + current.code + '</code>\n' +
            '    <type typecode="' + current.typeCode + '">' + current.type + '</type>\n' +
            '    <message>' + current.message + '</message>\n' +
            '    <selector><![CDATA[' + current.selector + ']]></selector>\n' +
            '    <context><![CDATA[' + current.context + ']]></context>\n' +
            '  </result>\n';
        outputXML = outputXML + result;
    }
    outputXML = outputXML + '</pa11y>\n';
    return outputXML;
}

module.exports = formatXML;
