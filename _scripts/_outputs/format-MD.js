function formatMD(imageStats, results, urlValue) {

    var output = '# ' + urlValue + '\n\n';
        // Ensure that the imageStats Object is not empty
        if (!(Object.keys(imageStats).length === 0 && imageStats.constructor === Object)){
            output = output + '## Image Accessibility\n\n';
            output = output + '**Total Images:** ' + imageStats.totalImages + '  \n';
            output = output + '**Descriptive Alt Text:** ' + imageStats.descriptive + '  \n';
            output = output + '**Non-descriptive Alt Text:** ' + imageStats.nondescriptive + '  \n';
            output = output + '**Percent of images with Descriptive Alt Text:** ' + imageStats.descriptivePercent + '%  \n';
            output = output + '**Alt Text Under 100 Characters:** ' + imageStats.under100Char + '  \n';
            output = output + '**Percent of images with fewer than 100 Characters of Alt Text:** ' + imageStats.under100CharPercent + '%  \n';
            output = output + '**Images Under 100KB:** ' + imageStats.under100KB + '  \n';
            output = output + '**Percent of images Under 100 Kilobytes in size:** ' + imageStats.under100KBPercent + '%  \n';
            output = output + '**Images That Loaded:** ' + imageStats.imagesLoaded + '  \n';
            output = output + '**Percent of Images that Loaded:** ' + imageStats.imagesLoadedPercent + '%  \n';
            output = output + '**Total File Size In Bytes:** ' + imageStats.totalFileSizeInBytes + '  \n';
            output = output + '**Total File Size In Kilobytes:** ' + imageStats.totalFileSizeInKB + '  \n\n';
        }

        output = output + '## Results\n\n';
        var hr = '\n* * *\n\n';

        console.log(output);
        for (i = 0; i < results.length; i++) {
            var item = results[i];
            var code = '**Code:** ' + item.code + '  \n';
            var type = '**Type:** ' + item.type + '  \n';
            var typeCode = '**Type Code:** ' + item.typeCode + '  \n';
            var message = '**Message:** ' + item.message + '  \n';
            var selector = '**Selector:** `' + item.selector + '`  \n';
            var context = '**Context:**\n```\n' + item.context + '\n```\n';
            output = output + code + type + typeCode + message + selector + context;
            if (i < results.length - 1) {
                output = output + hr;
            }
        }
        return output;
}

module.exports = formatMD;
