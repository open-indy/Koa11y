/* eslint-disable no-multi-spaces */
/* eslint-disable indent */ // TODO: Fix this after merging Rob's stuff
// Testing line ending
var nw = require('nw.gui');
var $ = window.$;
var Vue = window.Vue;
var httpVueLoader = window.httpVueLoader;
var updateDonutChart = window.updateDonutChart;
var keyBindings = require('./_functions/key-bindings');
var tryParseJSON = require('./_functions/try-parse-json');
var cleanURL = require('./_functions/clean-url');
var makeDesktopPath = require('./_functions/my-desktop-path');
var formatJSON = require('./_outputs/format-JSON');
var formatCSV = require('./_outputs/format-CSV');
var formatMD = require('./_outputs/format-MD');
var formatXML = require('./_outputs/format-XML');
var formatHTML = require('./_outputs/format-HTML');

var fs = require('fs-extra');
var path = require('path');
var base64Img = require('base64-img');
var appData = nw.App.dataPath;
var temp = path.join(appData, 'temp');

// register components
Vue.component('modal');
Vue.component('simple-donut');

var app = new Vue({
    el: '#app',
    components: {
        'modal': httpVueLoader('_scripts/_templates/modal.vue'),
        'simple-donut': httpVueLoader('_scripts/_templates/simple-donut.vue')
    },
    data: {
        version: '3.0.0',

        url: 'http://google.com',
        outputFileName: 'google com',
        outputType: 'html',
        outputTypes: {
            html: 'HTML',
            csv: 'CSV',
            json: 'JSON',
            md: 'Markdown',
            xml: 'XML'
        },
        standard: 'wcagaa',
        standards: {
            section: 'Section 508',
            wcaga: 'WCAG 2.0 A',
            wcagaa: 'WCAG 2.0 AA',
            wcagaaa: 'WCAG 2.0 AAA'
        },
        folderPicker: '',
        imageAlts: '',

        errorsButton: true,
        warningsButton: true,
        noticesButton: true,
        badges: {
            errors: 0,
            warnings: 0,
            notices: 0
        },

        submitAllowed: false,

        aboutModal: false,
        contributors: [
            { name: 'The Jared Wilcurt',   url: 'http://TheJaredWilcurt.com'               },
            { name: 'Rob Gaston',          url: 'https://github.com/robgaston1'            },
            { name: 'Marissa Staller',     url: 'https://github.com/mardisworld'           },
            { name: 'James Boyer',         url: 'https://github.com/jamesboyer92'          }
        ],
        technologies: [
            { name: 'Pa11y',               url: 'http://pa11y.org'                         },
            { name: 'NW.js',               url: 'http://nwjs.io'                           },
            { name: 'Vue.js',              url: 'http://vuejs.org'                         },
            { name: 'jQuery',              url: 'http://jquery.com'                        },
            { name: 'Sass',                url: 'http://sass-lang.com'                     },
            { name: 'Bootstrap',           url: 'http://getbootstrap.com'                  },
            { name: 'Bootswatch (Flatly)', url: 'https://bootswatch.com/flatly'            },
            { name: 'nw-contextmenu',      url: 'https://github.com/b1rdex/nw-contextmenu' }
        ],

        notifications: ''
    },
    methods: {
        // Settings and defaults
        loadSettings: function () {
            var settingsFile = path.join(nw.App.dataPath, 'koa11y-settings.json');
            var options = {
                encoding: 'utf-8'
            };

            fs.readFile(settingsFile, options, function (err, data) {
                if (err) {
                    // eslint-disable-next-line
                    console.warn('Settings file not found, probably not a big deal.');
                    return;
                }

                var semVer = require('semver');
                var settings = JSON.parse(data);

                // If the old settings file is below v2.0.0 delete the settings file
                if (settings.version && semVer.lt(settings.version, '3.0.0')) {
                    // eslint-disable-next-line
                    console.log('Old settings file (Verision ' + settings.version + '). Nothing loaded.');
                    return;
                }

                for (var key in settings) {
                    if (key !== 'version') {
                        this[key] = settings[key];
                    }
                }

                // Give defaults for empty values
                if (settings.url === '') {
                    this.url = 'http://google.com';
                }
                if (settings.outputFileName === '') {
                    this.urlKeyup();
                }
                if (settings.folderPicker === '') {
                    this.prefillOutput();
                }

                this.unlockRun();
            }.bind(this));
        },
        saveSettings: function () {
            var saveData = {
                url: this.url,
                outputFileName: this.outputFileName,
                folderPicker: this.folderPicker,

                outputType: this.outputType,
                standard: this.standard,

                errorsButton: this.errorsButton,
                warningsButton: this.warningsButton,
                noticesButton: this.noticesButton,

                version: this.version
            };

            var settingsFile = path.join(nw.App.dataPath, 'koa11y-settings.json');
            var settingsJSON = JSON.stringify(saveData, null, 2);

            this.writeToFile(settingsFile, settingsJSON);
        },
        deleteSettings: function (bool) {
            if (bool) {
                var settingsFile = path.join(nw.App.dataPath, 'koa11y-settings.json');
                fs.unlinkSync(settingsFile);
                nw.Window.get().reload();
            }
        },
        prefillOutput: function () {
            this.folderPicker = makeDesktopPath();
        },

        // Alerts
        successMessage: function (file, ext) {
            var filetype = ext.toUpperCase();
            if (filetype == 'MARKDOWN') {
                filetype = 'Markdown';
            }
            // TODO: Handle this in a more Vue way
            var message =
                '<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4>' +
                        '<p>Your <strong>' + filetype + '</strong> file has been saved.</p>' +
                    '</h4>' +
                    '<p>' + file + '</p>' +
                '</div>';
            this.notifications = message;
        },
        errorMessage: function (error) {
            // TODO: Handle this in a more Vue way
            var markup =
                '<div class="alert alert-danger alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4>' +
                        '<p>Pa11y Error:</p>' +
                    '</h4>' +
                    '<p>' + error + '</p>' +
                '</div>';
            this.notifications = markup;
        },

        // Helpers
        reset: function () {
            // TODO: Rename #results to #notifications or something
            // Put all potential DOM elements that could be displayed
            // there into the DOM by default. Hide/Show them based
            // on Vue. Then remove this .empty() line.
            $('#results').empty();
            this.badges.errors = 0;
            this.badges.warnings = 0;
            this.badges.notices = 0;
        },
        unlockRun: function () {
            var url = this.url;
            var destination = this.folderPicker;
            var file = this.outputFileName;

            var anyButtonEnabled = (this.errorsButton || this.warningsButton || this.noticesButton);

            var imgAltsParsed = '';
            if (this.imageAlts) {
                imgAltsParsed = tryParseJSON(this.imageAlts);
            }
            var imageAltsInUse = !!this.imageAlts && (imgAltsParsed.length > 0) && (typeof(imgAltsParsed) === 'object');

            // To unlock you need a URL/Destination/Filename and at least one button pressed (err/warn/notice), or some valid JSON in the imageAlts box
            if (url && destination && file && (anyButtonEnabled || imageAltsInUse)) {
                this.submitAllowed = false;
            } else {
                this.submitAllowed = true;
            }
        },
        externalLink: function (url) {
            event.preventDefault();
            // Open in user's default browser
            nw.Shell.openExternal(url);
        },
        /**
         * This will override the contents of a file you pass in with
         * the data you supply. If the file you point to doesn't exist,
         * it will be created with your supplied data.
         *
         * @param  {string}   filePathAndName Path to file
         * @param  {string}   data            The contents that should be saved
         * @param  {Function} callback        Optional callback function
         */
        writeToFile: function (filePathAndName, data, callback) {
            // Validate that required arguments are passed and are the correct types
            if (!filePathAndName) {
                // eslint-disable-next-line
                console.info('Supply a path to the file you want to create or replace the contents of as the first argument to this function.');
                return;
            } else if (typeof(filePathAndName) !== 'string') {
                // eslint-disable-next-line
                console.info('File path and name must be passed as a string.');
                return;
            } else if (!data) {
                // eslint-disable-next-line
                console.info('You must pass in the data to be stored as the second argument to this function.');
                return;
            } else if (typeof(data) !== 'string') {
                // eslint-disable-next-line
                console.info('The data to be stored must be passed as a string.');
                return;
            } else if (callback && typeof(callback) !== 'function') {
                // eslint-disable-next-line
                console.info('Your callback must be passed as a function.');
                return;
            }

            // Write to the file the user passed in
            fs.writeFile(filePathAndName, data, function (err) {
                // If there was a problem writing to the file
                if (err) {
                    // eslint-disable-next-line
                    console.info('There was an error attempting to write data to disk.');
                    // eslint-disable-next-line
                    console.warn({
                        filePathAndName: filePathAndName,
                        data: data,
                        error: err.message
                    });
                    return;
                // After file is saved/updated successfully, run the callback if it was passed in
                } else if (callback) {
                    callback();
                }
            });
        },

        // URL Stuff
        urlKeyup: function () {
            this.reset();
            this.outputFileName = cleanURL(this.url);
            this.saveSettings();
            this.unlockRun();
        },

        // Output Folder stuff
        outputFolderIcon: function () {
            var outputTextField = this.$refs.outputFolderBrowse;
            outputTextField.click();
        },
        outputFolderSet: function (evt) {
            this.folderPicker = evt.currentTarget.value;
            this.outputFolderChanged();
        },
        outputFolderChanged: function () {
            this.reset();
            this.saveSettings();
        },

        // Dropdowns (Standards/File Format)
        dropdownChanged: function () {
            this.reset();
            this.saveSettings();
            showHideImageAltsBox();
        },
        standardName: function () {
            return this.standards[this.standard];
        },
        outputTypeName: function () {
            return this.outputTypes[this.outputType];
        },

        // Error/Warning/Notice Buttons
        toggleButton: function (button) {
            event.preventDefault();
            this.reset();

            this[button] = !this[button];

            this.saveSettings();
            this.unlockRun();
        },

        clipboard: function (evt) {
            evt.preventDefault();
            var data = fs.readFileSync('_scripts/imgalts5.min.js', 'binary');
            var dummy = document.createElement('textarea');
            dummy.setAttribute('id', 'dummy');
            document.body.appendChild(dummy);
            var dumNode = document.getElementById('dummy');
            dumNode.value = data;
            dumNode.select();
            document.execCommand('copy');
            document.body.removeChild(dumNode);

            // TODO: Embed this in the #results directly and use Vue/CSS to show/fadeout
            var message =
                '<div class="alert alert-info alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4>Copied to Clipboard</h4>' +
                '</div>';
            $('#results').html(message);

            setTimeout(function () {
                $('#results .alert').fadeOut('slow');
            }, 700);
        }
    },
    watch: {
        aboutModal: function (newVal) {
            var className = 'modal-open';
            if (newVal) {
                document.body.classList.add(className);
            } else {
                document.body.classList.remove(className);
            }
        }
    }
});

app.prefillOutput();

$('.navbar-brand img').on('contextmenu', function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
    nw.Window.get().showDevTools();
});

if (process.platform === 'darwin') {
    keyBindings();
}


$('#imageAltsModal .modal-header .glyphicon-remove').click(function () {
    $('#imageAltsModal').slideUp('slow');
});


function showHideImageAltsBox () {
    if (app.outputType === 'csv') {
        $('#imageAltsSection').slideUp(480);
    } else {
        $('#imageAltsSection').slideDown(480);
    }
}

showHideImageAltsBox();

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

    // If there is text in the textarea and we aren't on CSV which doesn't support image stats output
    if (app.imageAlts && app.outputType !== 'csv') {
        // This will output an error if JSON is invalid, or if there is no text
        window.imgAltsParsed = tryParseJSON(app.imageAlts);
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
    app.reset();

    var filetype = 'html';
    var ext = '.html';
    if (app.outputType === 'csv') {
        filetype = 'csv';
        ext = '.csv';
    } else if (app.outputType === 'html') {
        filetype = 'html';
        ext = '.html';
    } else if (app.outputType === 'json') {
        filetype = 'json';
        ext = '.json';
    } else if (app.outputType === 'md') {
        filetype = 'markdown';
        ext = '.md';
    } else if (app.outputType === 'xml') {
        filetype = 'xml';
        ext = '.xml';
    }

    var standard = 'WCAG2AA';
    if (app.standard === 'section') {
        standard = 'Section508';
    } else if (app.standard === 'wcaga') {
        standard = 'WCAG2A';
    } else if (app.standard === 'wcagaa') {
        standard = 'WCAG2AA';
    } else if (app.standard === 'wcagaaa') {
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

    var url = app.url;
    var folderPicker = app.folderPicker;
    var fileName = app.outputFileName;
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
            app.errorMessage(error.message);
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

        app.badges.errors = badges.errors;
        app.badges.warnings = badges.warnings;
        app.badges.notices = badges.notices;

        // JSON
        if (app.outputType === 'json') {
            var outputJSON = formatJSON(window.imageStats, results);

            app.writeToFile(file, outputJSON);

            $('#results').html(app.successMessage(file, filetype));
        // CSV
        } else if (app.outputType === 'csv') {
            var outputCSV = formatCSV(window.imageStats, results);

            app.writeToFile(file, outputCSV);

            app.successMessage(file, filetype);
        // Markdown
        } else if (app.outputType === 'md') {
            var outputMD = formatMD(window.imageStats, results, app.url);

            app.writeToFile(file, outputMD);

            app.successMessage(file, filetype);
        // XML
        } else if (app.outputType === 'xml') {
            var outputXML = formatXML(window.imageStats, results);

            app.writeToFile(file, outputXML);

            app.successMessage(file, filetype);
        // HTML
        } else {
            var buttons = {
                errors: {
                    enabled: app.errorsButton,
                    amount: app.badges.errors
                },
                warnings: {
                    enabled: app.warningsButton,
                    amount: app.badges.warnings
                },
                notices: {
                    enabled: app.noticesButton,
                    amount: app.badges.notices
                }
            };

            var outputHTML = formatHTML(window.imageStats, results, url, buttons);

            app.writeToFile(file, outputHTML);
            app.successMessage(file, filetype);
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
/*
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
            app.errorMessage(err);
            return;
        }

        if (stderr) {
            // eslint-disable-next-line
            console.log(stderr);
            app.errorMessage(stderr);
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
*/






app.loadSettings();
