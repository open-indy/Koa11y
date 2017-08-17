var fs = require('fs-extra');

function formatHTML (imageStats, results, url, buttons) {
    var returnedErrors = '';
    var returnedWarnings = '';
    var returnedNotices = '';
    var panelColor = '';
    for (var i = 0; i < results.length; i++) {
        var resultsType = results[i].type;
        if (resultsType == 'warning') {
            panelColor = 'warning';
        } else if (resultsType == 'error') {
            panelColor = 'danger';
        } else if (resultsType == 'notice') {
            panelColor = 'primary';
        }

        var theContext = results[i].context;
        theContext = theContext.split('<').join('&lt;');
        var theMessage = results[i].message;
        theMessage = theMessage.replace('. Recommendation: ', '. <strong>Recommendation:</strong> ');
        var entry =
          '<div class="panel panel-' + panelColor + '">\n' +
            '<div class="panel-heading">' + results[i].code + '</div>\n' +
            '<div class="panel-body">\n' +
              '<strong class="text-capitalize">' + resultsType + ':</strong> ' + theMessage + '<br /><br />\n' +
              '<pre><code>' + theContext + '</code></pre>\n' +
            '</div>\n' +
            '<div class="panel-footer text-sm"><h4><small>' + results[i].selector + '</small></h4></div>\n' +
          '</div>\n';

        if (resultsType == 'error') {
            returnedErrors = returnedErrors + entry;
        } else if (resultsType == 'warning') {
            returnedWarnings = returnedWarnings + entry;
        } else if (resultsType == 'notice') {
            returnedNotices = returnedNotices + entry;
        }
    }

    var template = fs.readFileSync('_markup/template.html', 'utf8');

    console.log(template);
    var results = returnedErrors + returnedWarnings + returnedNotices;

    var imgAlts = '';

    // Ensure that the imageStats Object is not empty
    if (!(Object.keys(imageStats).length === 0 && imageStats.constructor === Object)) {
        var totalImages = imageStats.totalImages;
        var descriptive = imageStats.descriptive;
        var descriptivePercent = imageStats.descriptivePercent;
        var under100Char = imageStats.under100Char;
        var under100CharPercent = imageStats.under100CharPercent;
        var under100KB = imageStats.under100KB;
        var under100KBPercent = imageStats.under100KBPercent;
        var imagesLoaded = imageStats.imagesLoaded;
        var imagesLoadedPercent = imageStats.imagesLoadedPercent;
        var totalFileSizeInKB = imageStats.totalFileSizeInKB;
        var descriptiveStyle = 'success glyphicon-ok';
        var under100CharStyle = 'success glyphicon-ok';
        var under100KBStyle = 'success glyphicon-ok';
        var imagesLoadedStyle = 'success glyphicon-ok';
        if (descriptivePercent  < 100) { descriptiveStyle  = 'danger glyphicon-remove'; }
        if (under100CharPercent < 100) { under100CharStyle = 'danger glyphicon-remove'; }
        if (under100KBPercent   < 100) { under100KBStyle   = 'danger glyphicon-remove'; }
        if (imagesLoadedPercent < 100) { imagesLoadedStyle = 'danger glyphicon-remove'; }

        imgAlts =
          '<div class="row">' +
            '<div class="panel panel-primary">' +
              '<div class="panel-heading">Image Accessibility</div>' +
              '<div class="panel-body">' +
                '<p><i class="glyphicon text-' + descriptiveStyle  + '"></i> <strong>' + descriptivePercent  + '%</strong> of images on the page had descriptive ALT text. <strong>(' + descriptive + '/' + totalImages + ')</strong></p>' +
                '<p><i class="glyphicon text-' + under100CharStyle + '"></i> <strong>' + under100CharPercent + '%</strong> of ALTs were under 100 characters. <strong>(' + under100Char + '/' + totalImages + ')</strong></p>' +
                '<p><i class="glyphicon text-' + under100KBStyle   + '"></i> <strong>' + under100KBPercent   + '%</strong> of images were under 100KB in size. <strong>(' + under100KB + '/' + totalImages + ')</strong></p>' +
                '<p><i class="glyphicon text-' + imagesLoadedStyle + '"></i> <strong>' + imagesLoadedPercent + '%</strong> of images loaded with a total image payload of <strong>' + totalFileSizeInKB + 'KB (' + imagesLoaded + '/' + totalImages + ')</strong></p>' +
              '</div>' +
            '</div>' +
          '</div>';
    }

    var content =
        '    <div class="row">\n' +
        '      <span id="buttons">' + buttons + '</span>\n' +
        '      <h1>' + url + '</h1>\n' +
        '    </div>\n' +
             imgAlts + '\n' +
        '    <div class="row">' + results + '</div>\n';
    var output = template.replace('<!-- Content goes here -->', content);

    return output;
}

module.exports = formatHTML;
