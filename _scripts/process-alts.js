var fakeData = [
    { "src": "http://scout-app.io/_img/scout-app-logo.svg",     "alt": "Scout-App 2 Logo featuring Scout the Puppy."  },
    { "src": "http://scout-app.io/_img/logo-win.svg",           "alt": "Windows"                                      },
    { "src": "http://scout-app.io/_img/logo-ubuntu.svg",        "alt": "Ubuntu"                                       },
    { "src": "http://scout-app.io/_img/logo-zorin.svg",         "alt": "Zorin"                                        },
    { "src": "http://scout-app.io/_img/logo-osx.svg",           "alt": "OSX"                                          },
    { "src": "http://scout-app.io/_img/screenshots/win/01.png", "alt": "First Time User Experience (Windows 7)"       },
    { "src": "http://scout-app.io/_img/screenshots/win/02.png", "alt": "Project view (Windows 7)"                     },
    { "src": "http://scout-app.io/_img/screenshots/win/25.png", "alt": "Multi-Project Import (Windows 7)"             },
    { "src": "",                                                "alt": "Status of All Projects (Windows 7)"           },
    { "src": "",                                                "alt": "Dev Tools are always accessible (Windows 7)"  },
    { "src": "",                                                "alt": "Windows 10"                                   },
    { "src": "http://scout-app.io/_img/logo-win.svg",           "alt": "Windows"                                      },
    { "src": "http://scout-app.io/_img/logo-ubuntu.svg",        "alt": "Ubuntu"                                       },
    { "src": "http://scout-app.io/_img/logo-zorin.svg",         "alt": "Zorin"                                        },
    { "src": "http://scout-app.io/_img/logo-osx.svg",           "alt": "OSX"                                          },
    { "src": "http://scout-app.io/_img/screenshots/win/02.png", "alt": "English (Windows 7)"                          },
    { "src": "http://scout-app.io/_img/screenshots/win/03.png", "alt": "Dutch (Windows 7)"                            },
    { "src": "http://scout-app.io/_img/screenshots/win/04.png", "alt": "French (Windows 7)"                           },
    { "src": "",                                                "alt": "Russian (Windows 7)"                          },
    { "src": "http://scout-app.io/_img/logo-win.svg",           "alt": "Windows"                                      },
    { "src": "http://scout-app.io/_img/logo-ubuntu.svg",        "alt": "Ubuntu"                                       },
    { "src": "http://scout-app.io/_img/logo-zorin.svg",         "alt": "Zorin"                                        },
    { "src": "http://scout-app.io/_img/logo-osx.svg",           "alt": "OSX"                                          },
    { "src": "http://scout-app.io/_img/screenshots/win/02.png", "alt": "Simplex (Windows 7)"                          },
    { "src": "http://scout-app.io/_img/screenshots/win/06.png", "alt": "Cerulean (Windows 7)"                         },
    { "src": "http://scout-app.io/_img/screenshots/win/07.png", "alt": "Classic (Windows 7)"                          },
    { "src": "",                                                "alt": "Cosmo (Windows 7)"                            },
    { "src": "",                                                "alt": "W3suli.com (Windows 7)"                       },
    { "src": "",                                                "alt": "Yeti (Windows 7)"                             },
    { "src": "http://scout-app.io/_img/logo-nodesass.svg",      "alt": "The Node-Sass engine."                        },
    { "src": "http://scout-app.io/_img/logo-ugui.png",          "alt": "The Universal GUI Library/Framework"          },
    { "src": "http://scout-app.io/_img/logo-nwjs.png",          "alt": "The NW.js Cross-Platform Runtime Environment" },
    { "src": "http://scout-app.io/_img/devswag.png",            "alt": "DevSwag Logo"                                 },
    { "src": "http://scout-app.io/_img/big-sticker.png",        "alt": "Scout-App logo as a sticker"                  },
    { "src": "data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7",
                                                                "alt": "Data URI Test"                                }
];

/**
 * Process an array of objects, each containing the src and alt data for images.
 * @param  {array} data Array of objects. Each object has a "src" and "alt" for an image.
 */
function processAltsScript (data) {
    var fs = require('fs-extra');
    var path = require('path');
    var nw = require('nw.gui');
    var http = require('http');
    var https = require('https');
    var appData = nw.App.dataPath;
    var i = 0;

    function rmrf (location) {
        location = path.normalize(location);
        while (fs.existsSync(location)) {
            if (process.platform == 'win32') {
                require('child_process').execSync('rd /S /Q ' + location);
            } else {
                fs.removeSync(location);
            }
        }
    }

    rmrf(path.join(appData, 'temp'));
    fs.mkdirSync(path.join(appData, 'temp'));

    function downloadComplete (response, newFile) {

        if (response.statusCode == 200) {
            response.pipe(fs.createWriteStream(newFile));
            if (i < data.length) {
                i = i + 1;
                downloadImage();
            }
        } else {
            console.log(response.statusCode);
        }
    }

    function downloadImage () {
        var image = data[i];
        if (image.src.length > 1 && image.alt.length > 1) {
            var ext = path.extname(image.src);
            var newFile = path.join(appData, 'temp', i + ext);
            var protocol = image.src.split('://')[0];

            if (protocol == 'http') {
                http.get(image.src, function (response) {
                    downloadComplete(response, newFile);
                });
            } else if (protocol == 'https') {
                https.get(image.src, function (response) {
                    downloadComplete(response, newFile);
                });
            }
        } else if (i < data.length) {
            i = i + 1;
            downloadImage();
        } else {
            console.log('done');
        }
    }

    downloadImage();
}

// LEFT TO DO:
// Create a UI to accept the new array of objects
// Pass that into the stuff above
// process all the data and produce stats on an object
// Run Pa11y and then prepend stuff to the output file.
