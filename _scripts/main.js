/* global $ */

$(document).ready(function () {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
    function numberWithCommas (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }


    // Crossbrowser.js will add win, linux, or mac to the class of the html tag
    // We manually set it to Windows by default in case JS doesn't load.
    // But if the JS does load we swap out the image/link depending on the user's OS
    var lin = '_img/screenshot-lin.png';
    var osx = '_img/screenshot-osx.png';
    if ($('html').hasClass('linux')) {
        $('#screenshot').attr('href', lin);
        $('#screenshot img').attr('src', lin);
    } else if ($('html').hasClass('mac')) {
        $('#screenshot').attr('href', osx);
        $('#screenshot img').attr('src', osx);
    }


    $.get('https://api.github.com/repos/open-indy/Koa11y/releases', function (data) {
        var totalDownloads = [];
        var win = [];
        var lin = [];
        var osx = [];
        for (var i = 0; i < data.length; i++) {
            var currentRelease = data[i];
            var version = currentRelease.tag_name;
            // var versionNumber = version.split('v')[1];
            var dateTime = currentRelease.created_at;
            var date = dateTime.split('T')[0];
            var release = '<a href="https://github.com/open-indy/Koa11y/releases/tag/' + version + '" title="View release notes">' + date + '</a>';
            var downloadURL = '#';
            var downloads = 'N/A';
            var sizeMB = 'N/A';
            // var downloadAndVersion = 'Koa11y ' + version;
            if (currentRelease.assets.length > 0) {
                for (var j = 0; j < currentRelease.assets.length; j++) {
                    var asset = currentRelease.assets[j];
                    downloadURL = asset.browser_download_url;
                    downloads = asset.download_count;
                    var Bytes = asset.size;
                    var KB = Bytes / 1024;
                    var MB = KB / 1024;
                    sizeMB = '<span title="' + numberWithCommas(Math.round(KB)) + ' KB">' + (Math.round(MB * 10) / 10) + ' MB</span>';
                    var name = asset.name;
                    var download = '<a href="' + downloadURL + '" title="Download this version">' + name + '</a>';
                    totalDownloads.push(downloads);
                    // If file is bigger than 15MB
                    if (Bytes > 15000000) {
                        if (name.toLowerCase().startsWith('w')) {
                            win.push(downloads);
                        } else if (name.toLowerCase().startsWith('l')) {
                            lin.push(downloads);
                        } else if (name.toLowerCase().startsWith('o')) {
                            osx.push(downloads);
                        }
                    }
                    // Make the line between releases thicker
                    var tr = '<tr>';
                    if (j == 0 && i == 0) {
                        tr = '<tr class="latest-release">';
                    } else if (j == 0) {
                        tr = '<tr class="new-release">';
                    }
                    $('#output tbody').append(
                        tr +
                          '<td><strong>' + version + '</strong></td>' +
                          '<td>' + download + '</td>' +
                          '<td>' + sizeMB + '</td>' +
                          '<td>' + release + '</td>' +
                          '<td>' + downloads + '</td>' +
                        '</tr>'
                    );
                }
            } else {
                $('#output tbody').append(
                    '<tr>' +
                      '<td><strong>' + version + '</strong></td>' +
                      '<td>' + download + '</td>' +
                      '<td>' + sizeMB + '</td>' +
                      '<td>' + release + '</td>' +
                      '<td>' + downloads + '</td>' +
                    '</tr>'
                );
            }
        }
        var downloadCount = 0;
        var downloadCountWIN = 0;
        var downloadCountLIN = 0;
        var downloadCountOSX = 0;
        for (var k = 0; k < totalDownloads.length; k++) {
            downloadCount = downloadCount + totalDownloads[k];
        }
        for (var l = 0; l < win.length; l++) {
            downloadCountWIN = downloadCountWIN + win[l];
        }
        for (var m = 0; m < lin.length; m++) {
            downloadCountLIN = downloadCountLIN + lin[m];
        }
        for (var n = 0; n < osx.length; n++) {
            downloadCountOSX = downloadCountOSX + osx[n];
        }
        $('#total').html('<p>The official releases of Koa11y have been downloaded <strong>' + downloadCount + ' times</strong>.</p>');
        var withoutCLI = downloadCountWIN + downloadCountLIN + downloadCountOSX;

        $('#os .win').width(Math.round((downloadCountWIN / withoutCLI) * 100) + '%').attr('title', downloadCountWIN + ' downloads');
        $('#os .lin').width(Math.round((downloadCountLIN / withoutCLI) * 100) + '%').attr('title', downloadCountLIN + ' downloads');
        $('#os .osx').width(Math.round((downloadCountOSX / withoutCLI) * 100) + '%').attr('title', downloadCountOSX + ' downloads');
        $('#os').css('visibility', 'visible');


        // This part needs revised:
        if (data && data.length > 0) {
            var latestVersion = data[0].tag_name.split('v')[1];
            var baseURL = 'https://github.com/open-indy/Koa11y/releases/download/v' + latestVersion + '/';
            /* eslint-disable space-in-parens, no-multi-spaces */
            $('.dl-btn-win a').attr(               'href', baseURL + 'WIN_Koa11y_'   + latestVersion + '.zip');
            $('.dl-btn-osx a').attr(               'href', baseURL + 'OSX_Koa11y_'   + latestVersion + '.zip');
            $('.dl-btn-lin32 a').attr(             'href', baseURL + 'LIN32_Koa11y_' + latestVersion + '.zip');
            $('.dl-btn-lin64 a').attr(             'href', baseURL + 'LIN64_Koa11y_' + latestVersion + '.zip');
            $('.dl-btn-lin a:first-of-type').attr( 'href', baseURL + 'LIN32_Koa11y_' + latestVersion + '.zip');
            $('.dl-btn-lin a:last-of-type').attr(  'href', baseURL + 'LIN64_Koa11y_' + latestVersion + '.zip');
        }
    });
});
