/* eslint-disable no-multi-spaces */
// Testing line ending
var nw = require('nw.gui');
var $ = window.$;
var ugui = window.ugui;
var updateDonutChart = window.updateDonutChart;
var keybindings = require('./key-bindings');

// Wait for the document to load, then load settings for the user, then run the app.
$(document).ready(function () {
    ugui.helpers.loadSettings(runApp);
});

// Container for your app's custom JS
function runApp () {

    var fs = require('fs-extra');
    var path = require('path');
    var base64Img = require('base64-img');
    var appData = nw.App.dataPath;
    var temp = path.join(appData, 'temp');

    $('.navbar-brand img').on('contextmenu', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        nw.Window.get().showDevTools();
    });

    function tryParseJSON (jsonString) {
        try {
            var obj = JSON.parse(jsonString);
            if (obj && typeof obj === 'object') {
                return obj;
            }
        } catch (err) {
            // eslint-disable-line no-empty
            // If we log the err here it will spam the console anytime the user pastes non-json or types in the box
        }

        return false;
    }

    function cleanURL () {
        var url = $('#url').val();
        url = url.replace('https://', '');
        url = url.replace('http://', '');
        url = url.replace('www.', '');
        url = url.replace('.html', '');
        url = url.replace('.htm', '');
        url = url.replace('.php', '');
        url = url.replace('.aspx', '');
        url = url.replace('.asp', '');
        url = url.replace('.cfm', '');
        url = url.split('.').join(' ');
        url = url.split('/').join(' ');
        url = url.split('?').join(' ');
        url = url.split('&').join(' ');
        url = url.split('|').join(' ');
        url = url.split('=').join(' ');
        url = url.split('*').join(' ');
        url = url.split('\\').join(' ');
        url = url.split('"').join(' ');
        url = url.split(':').join(' ');
        url = url.split('<').join(' ');
        url = url.split('>').join(' ');
        return url;
    }

  

    if (process.platform === 'darwin') {
        keyBindings();
    }
    
    

    function unlockRun () {
        ugui.helpers.buildUGUIArgObject();
        var url = ugui.args.url.value;
        var dest = ugui.args.folderPicker.value;
        var file = ugui.args.output.value;
        var errorsButton = (ugui.args.badgeError.value === 'true');
        var warningsButton = (ugui.args.badgeWarning.value === 'true');
        var noticesButton = (ugui.args.badgeNotice.value === 'true');
        var imgAltsVal = $('#imagealts').val();
        var imgAltsParsed = '';
        if (imgAltsVal) {
            imgAltsParsed = tryParseJSON(imgAltsVal);
        }
        // To unlock you need a URL/Destination/Filename and at least one button pressed (err/warn/notic), or some valid JSON in the imageAlts box
        if (url && dest && file && ((errorsButton || warningsButton || noticesButton) || (!!imgAltsVal && (imgAltsParsed.length > 0) && (typeof(imgAltsParsed) == 'object')))) {
            $('#run').prop('disabled', false);
        } else {
            $('#run').prop('disabled', true);
        }
    }

    function urlKeyup () {
        reset();
        // Cleaned string
        var url = cleanURL();
        $('#output').val(url);
        ugui.helpers.saveSettings();
        unlockRun();
    }
    $('#url').change(urlKeyup);
    $('#url').keyup(urlKeyup);

    $('#output').change(unlockRun);
    $('#output').keyup(unlockRun);
    $('#imagealts').change(unlockRun);
    $('#imagealts').keyup(unlockRun);

    function prefillURL () {
        $('#url').val('http://google.com');
        urlKeyup();
    }
    function prefillOutput () {
        var homePath = '';
        if (process.platform == 'linux') {
            homePath = process.env.HOME;
        } else if (process.platform == 'win32') {
            homePath = process.env.USERPROFILE;
        } else if (process.platform == 'darwin') {
            homePath = '/Users/' + process.env.USER;
            if (process.env.HOME) {
                homePath = process.env.HOME;
            }
        }
        var myDesktopPath = path.join(homePath, 'Desktop');
        $('#folderPicker').val(myDesktopPath);
    }
    function prefillData () {
        ugui.helpers.buildUGUIArgObject();
        if (!ugui.args.url.value) {
            prefillURL();
        }
        if (!ugui.args.folderPicker.value) {
            prefillOutput();
        }
    }
    prefillData();

    function reset () {
        $('#results').empty();
        $('#button-badges .badge').html('0');
    }

    function successMessage (file, ext) {
        var filetype = ext.toUpperCase();
        if (filetype == 'MARKDOWN') {
            filetype = 'Markdown';
        }
        var message =
            '<div class="alert alert-info alert-dismissible" role="alert">' +
                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4>' +
                    '<p>Your <strong>' + filetype + '</strong> file has been saved.</p>' +
                '</h4>' +
                '<p>' + file + '</p>' +
            '</div>';
        $('#results').html(message);
    }
    function errorMessage (error) {
        var markup =
            '<div class="alert alert-danger alert-dismissible" role="alert">' +
                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                '<h4>' +
                    '<p>Pa11y Error:</p>' +
                '</h4>' +
                '<p>' + error + '</p>' +
            '</div>';
        $('#results').html(markup);
    }

    $('#imageAltsModal .modal-header .glyphicon-remove').click(function () {
        $('#imageAltsModal').slideUp('slow');
    });

    $('#outputFolderIcon').click(function () {
        $('#outputFolderBrowse').click();
    });

    $('#outputFolderBrowse').change(function () {
        reset();
        var userDir = $(this).val();
        $('#folderPicker').val(userDir);
        ugui.helpers.saveSettings();
    });

    if (ugui.args.badgeError.value == 'false') {
        $('#button-badges .btn-danger').addClass('disabled');
    }
    if (ugui.args.badgeWarning.value == 'false') {
        $('#button-badges .btn-warning').addClass('disabled');
    }
    if (ugui.args.badgeNotice.value == 'false') {
        $('#button-badges .btn-primary').addClass('disabled');
    }

    $('#button-badges .btn-danger, #button-badges .btn-warning, #button-badges .btn-primary').click(function () {
        reset();

        if ($(this).hasClass('disabled')) {
            $(this).removeClass('disabled');
            $(this).val('true');
        } else {
            $(this).addClass('disabled');
            $(this).val('false');
        }

        ugui.helpers.buildUGUIArgObject();
        ugui.helpers.saveSettings();
        unlockRun();
    });

    function showHideImageAltsBox () {
        if (ugui.args.outputcsv.htmlticked) {
            $('#imageAltsSection').slideUp(480);
        } else {
            $('#imageAltsSection').slideDown(480);
        }
    }

    showHideImageAltsBox();

    $('input[name="standard"], input[name="outputtype"]').change(function () {
        reset();
        ugui.helpers.saveSettings();
        showHideImageAltsBox();
    });

    function clipboard (data) {
        $('#clipboard').click(function (evt) {
            evt.preventDefault();
            var dummy = document.createElement('textarea');
            dummy.setAttribute('id', 'dummy');
            document.body.appendChild(dummy);
            var dumNode = document.getElementById('dummy');
            dumNode.value = data;
            dumNode.select();
            document.execCommand('copy');
            document.body.removeChild(dumNode);

            var message =
                '<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4>Copied to Clipboard</h4>' +
                '</div>';
            $('#results').html(message);

            setTimeout(function () {
                $('#results .alert').fadeOut('slow');
            }, 700);
        });
    }

    clipboard(fs.readFileSync('_scripts/imgalts5.min.js', 'binary'));

    /**
     * Process an array of objects, each containing the src and alt data for images.
     * @param  {array} data Array of objects. Each object has a "src" and "alt" for an image.
     */
    function processAltsScript (callback) {
        var http = require('http');
        var https = require('https');
        var i = 0;

        var data = window.imgAltsParsed;

        function rmrf (location) {
            location = path.normalize(location);
            while (fs.existsSync(location)) {
                if (process.platform == 'win32') {
                    require('child_process').execSync('rd /S /Q "' + location + '"');
                } else {
                    fs.removeSync(location);
                }
            }
        }

        while (fs.existsSync(temp)) {
            rmrf(temp);
        }
        if (!fs.existsSync(temp)) {
            fs.mkdirSync(temp);
        }
        function imageAltsDonut (i) {
            if (typeof(i) === 'boolean') {
                updateDonutChart('#imageaAltsDonut', 100, true);
            } else {
                updateDonutChart('#imageAltsDonut', (100 * (i / data.length)), true);
            }
        }

        function downloadComplete (response, newFile) {
            if (response.statusCode == 200) {
                var piped = response.pipe(fs.createWriteStream(newFile));
                window.imgAltsParsed[i].path = newFile;
                piped.on('finish', function () {
                    i = i + 1;
                    imageAltsDonut(i);
                    downloadImage();
                });
            } else {
                // eslint-disable-next-line
                console.log(response.statusCode, newFile, 'failed');
                i = i + 1;
                imageAltsDonut(i);
                downloadImage();
            }
        }

        function downloadImage () {
            if (i <= data.length - 1) {
                var image = data[i];
                // If there is a src
                if (image.src.length > 1) {
                    var ext = path.extname(image.src);
                    ext = ext.split('?')[0].split('#')[0];
                    var newFile = path.join(appData, 'temp', i + ext);
                    var protocol = image.src.split('://')[0];

                    if (image.src.indexOf('data:image/') == 0) {
                        // eslint-disable-next-line no-unused-vars
                        base64Img.img(image.src, path.join(appData, 'temp'), i, function (err, filepath) {
                            window.imgAltsParsed[i].path = filepath;
                            if (err) {
                                // eslint-disable-next-line no-console
                                console.log(err);
                            }
                            i = i + 1;
                            imageAltsDonut(i);
                            downloadImage();
                        });
                    } else if (protocol == 'http') {
                        http.get(image.src, function (response) {
                            downloadComplete(response, newFile);
                        });
                    } else if (protocol == 'https') {
                        https.get(image.src, function (response) {
                            downloadComplete(response, newFile);
                        });
                    } else if (i < data.length - 1) {
                        i = i + 1;
                        imageAltsDonut(i);
                        downloadImage();
                    } else {
                        imageAltsDonut(true);
                        callback();
                    }
                // If it is missing a src or alt, but isn't the last image
                } else if (i < data.length - 1) {
                    i = i + 1;
                    imageAltsDonut(i);
                    downloadImage();
                // done
                } else {
                    imageAltsDonut(true);
                    callback();
                }
            // done
            } else {
                imageAltsDonut(true);
                callback();
            }
        }
        downloadImage();
    }

    function loadImagesInModal () {
        $('#imageAltsDonut').fadeOut('fast');
        $('#imageAltsThumbs').html('<h3>Is the text under the image descriptive?</h3>');

        var images = window.imgAltsParsed;

        images.forEach(function (file, i) {
            var alt = file.alt;
            var src = file.src;
            if (file.path && fs.existsSync(file.path)) {
                src = 'file://' + file.path;
            } else if (file.src.length < 1) {
                src = '_img/broken.png';
            }
            if (alt) {
                var image =
                  '<div data-imgnum="' + i + '">' +
                    '<figure>' +
                      '<img src="' + src + '">' +
                      '<figcaption>' + alt + '</figcaption>' +
                    '</figure>' +
                    '<button class="btn disabled btn-success">Yes</button>' +
                    '<button class="btn disabled btn-danger">No</button>' +
                  '</div>';
                $('#imageAltsThumbs').append(image);
            }
        });
        window.confirmedImages = [];
        $('#imageAltsThumbs .btn').click(function () {
            $(this).removeClass('disabled');
            $(this).siblings('.btn').addClass('disabled');
            var imgnum = $(this).parent().data('imgnum');
            var closestImg = $(this).siblings('figure').find('img');
            if ($(this).hasClass('btn-success')) {
                $(closestImg).addClass('bg-success');
                $(closestImg).removeClass('bg-warning');
            } else {
                $(closestImg).addClass('bg-warning');
                $(closestImg).removeClass('bg-success');
            }

            window.confirmedImages[imgnum] = $(this).hasClass('btn-success');
            var filtered = window.confirmedImages.filter(function (val) {
                if (typeof(val) != 'undefined') {
                    return true;
                } else {
                    return false;
                }
            });
            if ($('[data-imgnum]').length === filtered.length) {
                $('#imageAltsModal .modal-footer .btn').removeClass('disabled');
            } else {
                $('#imageAltsModal .modal-footer .btn').addClass('disabled');
            }
        });
    }

    $('#imageAltsModal .modal-footer .btn').click(function () {
        if (!$(this).hasClass('disabled')) {
            var imagesWithDescriptiveAltText = 0;
            var altTagsUnder100Characters = 0;
            var totalImages = window.imgAltsParsed.length;
            var imagesUnder100KB = 0;
            var totalFileSizeInBytes = 0;
            var imagesLoaded = 0;

            window.confirmedImages.forEach(function (img) {
                if (img) {
                    imagesWithDescriptiveAltText = imagesWithDescriptiveAltText + 1;
                }
            });

            for (var i = 0, len = window.imgAltsParsed.length; i < len; i++) {
                window.imgAltsParsed[i].size = 0;
                var imgPath = window.imgAltsParsed[i].path;
                var imgAlt = window.imgAltsParsed[i].alt;

                if (imgPath && imgPath.length > 1) {
                    window.imgAltsParsed[i].size = fs.statSync(imgPath).size;
                }

                var size = window.imgAltsParsed[i].size;

                if (size <= (100 * 1024)) {
                    imagesUnder100KB = imagesUnder100KB + 1;
                }
                totalFileSizeInBytes = totalFileSizeInBytes + size;

                if (size > 0) {
                    imagesLoaded = imagesLoaded + 1;
                }

                if (imgAlt.length <= 100) {
                    altTagsUnder100Characters = altTagsUnder100Characters + 1;
                }
            }

            window.imageStats = {
                'totalImages': totalImages,
                'descriptive': imagesWithDescriptiveAltText,
                'nondescriptive': totalImages - imagesWithDescriptiveAltText,
                'under100Char': altTagsUnder100Characters,
                'under100KB': imagesUnder100KB,
                'imagesLoaded': imagesLoaded,
                'totalFileSizeInBytes': totalFileSizeInBytes,
                'totalFileSizeInKB': Math.round((totalFileSizeInBytes / 1024) * 10) / 10,
                'descriptivePercent': Math.round((imagesWithDescriptiveAltText / totalImages) * 100),
                'under100CharPercent': Math.round((altTagsUnder100Characters / totalImages) * 100),
                'under100KBPercent': Math.round((imagesUnder100KB / totalImages) * 100),
                'imagesLoadedPercent': Math.round((imagesLoaded / totalImages) * 100)
            };

            $('#imageAltsModal').slideUp('slow');
            runPa11y();
        }
    });

    $('#run').click(function (evt) {
        evt.preventDefault();
        $('#imageAltsThumbs').empty();
        fs.emptyDirSync(path.join(nw.App.dataPath, 'temp'));
        window.imageStats = {};
        window.imgAltsParsed = [];

        var imgAltsVal = $('#imagealts').val();
        // If there is text in the textarea and we aren't on CSV which doesn't support image stats output
        if (imgAltsVal && !ugui.args.outputcsv.htmlticked) {
            // This will output an error if JSON is invalid, or if there is no text
            window.imgAltsParsed = tryParseJSON(imgAltsVal);
            // If the text is valid JSON
            if (window.imgAltsParsed.length > 0 && typeof(window.imgAltsParsed) == 'object') {
                $('#imageAltsModal').fadeIn('slow');
                $('#imageAltsDonut').fadeIn('fast');
                processAltsScript(loadImagesInModal);
            } else {
                runPa11y();
            }
        } else {
            runPa11y();
        }
    });

    function runPa11y () {
        $('#spinner').fadeIn('slow');
        reset();

        ugui.helpers.buildUGUIArgObject();

        var filetype = 'html';
        var ext = '.html';
        if (ugui.args.outputcsv.htmlticked) {
            filetype = 'csv';
            ext = '.csv';
        } else if (ugui.args.outputhtml.htmlticked) {
            filetype = 'html';
            ext = '.html';
        } else if (ugui.args.outputjson.htmlticked) {
            filetype = 'json';
            ext = '.json';
        } else if (ugui.args.outputmd.htmlticked) {
            filetype = 'markdown';
            ext = '.md';
        } else if (ugui.args.outputxml.htmlticked) {
            filetype = 'xml';
            ext = '.xml';
        }

        var standard = 'WCAG2AA';
        if (ugui.args.standardsection.htmlticked) {
            standard = 'Section508';
        } else if (ugui.args.standardwcaga.htmlticked) {
            standard = 'WCAG2A';
        } else if (ugui.args.standardwcagaa.htmlticked) {
            standard = 'WCAG2AA';
        } else if (ugui.args.standardwcagaaa.htmlticked) {
            standard = 'WCAG2AAA';
        }

        var ignore = [];
        if ($('#button-badges .btn-danger').hasClass('disabled')) {
            ignore.push('error');
        }
        if ($('#button-badges .btn-warning').hasClass('disabled')) {
            ignore.push('warning');
        }
        if ($('#button-badges .btn-primary').hasClass('disabled')) {
            ignore.push('notice');
        }

        var url = ugui.args.url.value;
        var folderPicker = ugui.args.folderPicker.value;
        var fileName = ugui.args.output.value;
        var file = path.join(folderPicker, fileName + ext);

        var pa11y = require('pa11y');
        var phantomjs = require('phantomjs-prebuilt');

        var test = pa11y({
            'phantomjs': {
                'path': phantomjs.path
            },
            'allowedStandards': [standard],
            'standard': standard,
            'reporter': filetype,
            'ignore': ignore
        });

        test.run(url, function (error, results) {
            $('#spinner').fadeOut('slow');

            if (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                errorMessage(error.message);
                return;
            }

            // Badges
            var badges = {
                'errors': 0,
                'warnings': 0,
                'notices': 0
            };
            var i = 0;

            for (i = 0; i < results.length; i++) {
                var theType = results[i].type;
                if (theType == 'error') {
                    badges.errors = badges.errors + 1;
                } else if (theType == 'warning') {
                    badges.warnings = badges.warnings + 1;
                } else if (theType == 'notice') {
                    badges.notices = badges.notices + 1;
                }
            }
            $('#button-row .btn-danger span').text(badges.errors);
            $('#button-row .btn-warning span').text(badges.warnings);
            $('#button-row .btn-primary span').text(badges.notices);

            // JSON
            if (ugui.args.outputjson.htmlticked) {
                var outputJSON = {};
                // Ensure that the imageStats Object is not empty
                if (!$.isEmptyObject(window.imageStats)) {
                    outputJSON.images = window.imageStats;
                }
                outputJSON.results = results;
                outputJSON = JSON.stringify(outputJSON, null, 2);

                ugui.helpers.writeToFile(file, outputJSON);
                $('#results').html(successMessage(file, filetype));
            // CSV
            } else if (ugui.args.outputcsv.htmlticked) {

                // Ensure that the imageStats Object is not empty
                if (!$.isEmptyObject(window.imageStats)) {
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

                ugui.helpers.writeToFile(file, outputCSV);

                successMessage(file, filetype);
            // Markdown
            } else if (ugui.args.outputmd.htmlticked) {
                var output = '# ' + ugui.args.url.value + '\n\n';
                // Ensure that the imageStats Object is not empty
                if (!$.isEmptyObject(window.imageStats)) {
                    output = output + '## Image Accessibility\n\n';
                    output = output + '**Total Images:** ' + window.imageStats.totalImages + '  \n';
                    output = output + '**Descriptive Alt Text:** ' + window.imageStats.descriptive + '  \n';
                    output = output + '**Non-descriptive Alt Text:** ' + window.imageStats.nondescriptive + '  \n';
                    output = output + '**Percent of images with Descriptive Alt Text:** ' + window.imageStats.descriptivePercent + '%  \n';
                    output = output + '**Alt Text Under 100 Characters:** ' + window.imageStats.under100Char + '  \n';
                    output = output + '**Percent of images with fewer than 100 Characters of Alt Text:** ' + window.imageStats.under100CharPercent + '%  \n';
                    output = output + '**Images Under 100KB:** ' + window.imageStats.under100KB + '  \n';
                    output = output + '**Percent of images Under 100 Kilobytes in size:** ' + window.imageStats.under100KBPercent + '%  \n';
                    output = output + '**Images That Loaded:** ' + window.imageStats.imagesLoaded + '  \n';
                    output = output + '**Percent of Images that Loaded:** ' + window.imageStats.imagesLoadedPercent + '%  \n';
                    output = output + '**Total File Size In Bytes:** ' + window.imageStats.totalFileSizeInBytes + '  \n';
                    output = output + '**Total File Size In Kilobytes:** ' + window.imageStats.totalFileSizeInKB + '  \n\n';
                }
                output = output + '## Results\n\n';
                var hr = '\n* * *\n\n';
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

                ugui.helpers.writeToFile(file, output);

                successMessage(file, filetype);
            // XML
            } else if (ugui.args.outputxml.htmlticked) {
                var outputXML = '<?xml version="1.0" encoding="UTF-8"?>\n<pa11y>\n';

                var imgAlts = '';
                // Ensure that the imageStats Object is not empty
                if (!$.isEmptyObject(window.imageStats)) {
                    imgAlts =
                        '  <imagealts>\n' +
                        '    <totalimages>' + window.imageStats.totalImages + '</totalimages>\n' +
                        '    <descriptive>' + window.imageStats.descriptive + '</descriptive>\n' +
                        '    <nondescriptive>' + window.imageStats.nondescriptive + '</nondescriptive>\n' +
                        '    <under100char>' + window.imageStats.under100Char + '</under100char>\n' +
                        '    <under100kb>' + window.imageStats.under100KB + '</under100kb>\n' +
                        '    <imagesloaded>' + window.imageStats.imagesLoaded + '</imagesloaded>\n' +
                        '    <totalfilesizeinbytes>' + window.imageStats.totalFileSizeInBytes + '</totalfilesizeinbytes>\n' +
                        '    <totalfilesizeinkb>' + window.imageStats.totalFileSizeInKB + '</totalfilesizeinkb>\n' +
                        '    <descriptivepercent>' + window.imageStats.descriptivePercent + '</descriptivepercent>\n' +
                        '    <under100charpercent>' + window.imageStats.under100CharPercent + '</under100charpercent>\n' +
                        '    <under100kbpercent>' + window.imageStats.under100KBPercent + '</under100kbpercent>\n' +
                        '    <imagesloadedpercent>' + window.imageStats.imagesLoadedPercent + '</imagesloadedpercent>\n' +
                        '  </imagealts>\n';
                }

                outputXML = outputXML + imgAlts;

                for (i = 0; i < results.length; i++) {
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

                ugui.helpers.writeToFile(file, outputXML);

                successMessage(file, filetype);
            // HTML
            } else {
                var returnedErrors = '';
                var returnedWarnings = '';
                var returnedNotices = '';
                var panelColor = '';
                for (i = 0; i < results.length; i++) {
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
                          '<strong class="text-capitalize">' + results[i].type + ':</strong> ' + theMessage + '<br /><br />\n' +
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

                $.get('_markup/template.html', function (template) {
                    var results = returnedErrors + returnedWarnings + returnedNotices;
                    var buttons = '';
                    $('#button-badges button:not(".disabled")').each(function () {
                        buttons = buttons + $(this).prop('outerHTML') + '\n';
                    });

                    var imgAlts = '';

                    // Ensure that the imageStats Object is not empty
                    if (!$.isEmptyObject(window.imageStats)) {
                        var totalImages = window.imageStats.totalImages;
                        var descriptive = window.imageStats.descriptive;
                        var descriptivePercent = window.imageStats.descriptivePercent;
                        var under100Char = window.imageStats.under100Char;
                        var under100CharPercent = window.imageStats.under100CharPercent;
                        var under100KB = window.imageStats.under100KB;
                        var under100KBPercent = window.imageStats.under100KBPercent;
                        var imagesLoaded = window.imageStats.imagesLoaded;
                        var imagesLoadedPercent = window.imageStats.imagesLoadedPercent;
                        var totalFileSizeInKB = window.imageStats.totalFileSizeInKB;
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

                    ugui.helpers.writeToFile(file, output);

                    successMessage(file, filetype);
                });
            }
        });
    }

    /**
     * Experimented with this, but not currently using it.
     *
     * The idea was to have PhantomJS go to the URL and run the ImgAlts script for us
     * to completely automate the process, however we still need the user to load the
     * lazy loading items on pages, and to confirm that alt tags are descriptive. So
     * this effort has been abandoned. Though it does successfully spin up and run our
     * phantom-imgalts.js script. So I'm keeping it here for future use, in case we
     * need to automate something else, or just as a reference for other projects.
     *
     * @param  {String}   url      URL for PhantomJS to load
     * @param  {Function} callback Callback to run upon PhantomJS script finishing
     * @return {Null}              Currently nothing, just console logs.
     */
    // eslint-disable-next-line
    function phantomImgAlts (url, callback) {
        if (!url) {
            // eslint-disable-next-line
            console.log('Pass in a URL.');
            return;
        }
        var path = require('path');
        var exec = require('child_process').execFile;
        var phantomjs = require('phantomjs-prebuilt');
        var binPath = phantomjs.path;

        var childArgs = [path.join(process.cwd(), '_scripts', 'phantom-imgalts.js'), url];

        exec(binPath, childArgs, function (err, stdout, stderr) {
            if (err) {
                // eslint-disable-next-line
                console.log(err);
                errorMessage(err);
                return;
            }

            if (stderr) {
                // eslint-disable-next-line
                console.log(stderr);
                errorMessage(stderr);
                return;
            }

            if (callback) {
                if (stdout == 'No URL passed in.') {
                    // eslint-disable-next-line
                    console.log(stdout);
                } else {
                    var data = JSON.parse(stdout);
                    callback(data);
                }
            } else {
                // eslint-disable-next-line
                console.log(stdout);
            }
        });
    }

    unlockRun();

} // end runApp();
