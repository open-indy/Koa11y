/* eslint-disable no-console */

var start = Date.now();

// ///////////////////////// //
//          IMPORTS          //
// ///////////////////////// //

var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').execSync;
var NwBuilder = require('nw-builder');
var rcedit = require('rcedit');
var zip = require('7zip-bin');


// ///////////////////////// //
//          SETTINGS         //
// ///////////////////////// //

var year = '2017';
var company = 'Open Indy Brigade';
var description = 'Find accessibility issues in webpages.';

var platform = process.platform;
if (process.platform === 'linux' && process.arch === 'ia32') {
    platform = 'linux32';
} else if (process.platform === 'linux' && process.arch === 'x64') {
    platform = 'linux64';
} else if (process.platform === 'darwin') {
    platform = 'osx64';
}

var nwBuildSettings = {
    version: '0.14.7',
    flavor: 'normal',
    appName: 'Koa11y',
    appVersion: '3.0.0',
    files: [
        './_fonts/**/*',
        './_img/**/*',
        './_markup/**/*',
        './_scripts/**/*',
        './_style/style.css',
        './_style/ven.bootstrap.css',
        './_style/ven.bootstrap/bootstrap.css',
        './_style/ven.bootswatch/flatly.min.css',
        './index.htm',
        './package.json',
        './LICENSE'
    ],
    winIco: './_img/fav.ico',
    platforms: [ platform ],
    zip: false
};

var junk = [
    'd3dcompiler_47.dll',
    'dbghelp.dll',
    'libEGL.dll',
    'libexif.dll',
    'libGLESv2.dll',
    'nw_200_percent.pak',
    'snapshot_blob.bin',
    'package.nw/node_modules/vue/src/',
    'package.nw/node_modules/vue/types/',
    'package.nw/node_modules/vue/dist/vue.common.js',
    'package.nw/node_modules/vue/dist/vue.esm.js',
    'package.nw/node_modules/vue/dist/vue.js',
    'package.nw/node_modules/vue/dist/vue.runtime.common.js',
    'package.nw/node_modules/vue/dist/vue.runtime.esm.js',
    'package.nw/node_modules/vue/dist/vue.runtime.js',
    'package.nw/node_modules/vue/dist/vue.runtime.min.js',
    'package.nw/node_modules/performance-now/src/',
    'package.nw/node_modules/performance-now/test/',
    'package.nw/node_modules/ajv/dist/ajv.min.js.map',
    'package.nw/node_modules/ajv/scripts/',
    'package.nw/node_modules/ajv/lib/ajv.d.ts',
    'package.nw/node_modules/ajv/dist/',
    'package.nw/node_modules/truffler/example/',
    'package.nw/node_modules/truffler/test/',
    'package.nw/node_modules/hawk/example/',
    'package.nw/node_modules/hawk/test/',
    'package.nw/node_modules/hawk/images/',
    'package.nw/node_modules/pa11y/example/',
    'package.nw/node_modules/pa11y/test/',
    'package.nw/node_modules/es6-promise/es6-promise.d.ts'
];


// ///////////////////////// //
//         FUNCTIONS         //
// ///////////////////////// //

function updateExe (done) {
    var extension = '';
    if (platform === 'win32') {
        extension = '.exe';
    }
    var executable = './build/' + nwBuildSettings.appName + '/' + platform + '/' + nwBuildSettings.appName + extension;

    var options = {
        'version-string': {
            'CompanyName': company,
            'FileDescription': description,
            'LegalCopyright': 'Copyright ' + year + '. ' + company,
            'ProductName': nwBuildSettings.appName
        },
        'file-version': nwBuildSettings.appVersion,
        'product-version': nwBuildSettings.appVersion
    };

    if (platform === 'win32') {
        rcedit(executable, options, function (a, b, c) {
            if (a) {
                console.log(a);
            }
            if (b) {
                console.log(b);
            }
            if (c) {
                console.log(c);
            }
            if (typeof(done) === 'function') {
                done();
            }
        });
    } else if (platform === 'linux64' || platform === 'linux32') {
        exec('chmod +x ' + executable);

        var fileName = 'Koa11y.desktop';
        var fileData =
            '[Desktop Entry]\n' +
            'Type=Application\n' +
            'Terminal=true\n' +
            'Name=Run ' + nwBuildSettings.appName + '\n' +
            'Icon=utilities-terminal\n' +
            'Exec=gnome-terminal -e "bash -c \'./' + nwBuildSettings.appName + ';$SHELL\'"\n' +
            'Categories=Application;';
        var filePath = './build/' + nwBuildSettings.appName + '/' + platform + '/' + fileName;
        fs.writeFileSync(filePath, fileData);

        // TODO: On Linux auto-make the exe runnable, or a runnable .desktop file

        exec('chmod +x ' + filePath);
        done();
    } else if (process.platform === 'darwin') {
        fs.copySync('./_img/app.icns', './build/' + nwBuildSettings.appName + '/osx64/' + nwBuildSettings.appName + '.app/Contents/Resources/app.icns');
        fs.copySync('./_img/document.icns', './build/' + nwBuildSettings.appName + '/osx64/' + nwBuildSettings.appName + '.app/Contents/Resources/document.icns');
        done();
    } else {
        done();
    }
}

function copyManifest () {
    var manifest = fs.readJsonSync('./package.json');
    manifest.devDependencies = {};
    manifest.name = nwBuildSettings.appName;
    var output = JSON.stringify(manifest, null, 2);
    var buildPackagePath = './build/' + nwBuildSettings.appName + '/' + platform + '/package.json';
    if (process.platform === 'darwin') {
        buildPackagePath = path.join('.', 'build', nwBuildSettings.appName, platform, nwBuildSettings.appName + '.app', 'Contents', 'Resources', 'app.nw', 'package.json');
    }
    fs.writeFileSync(buildPackagePath, output);
}

function changeDirectoryToBuildFolder () {
    var buildFolder = path.join(process.cwd(), 'build', nwBuildSettings.appName, platform);
    if (process.platform === 'darwin') {
        buildFolder = path.join(process.cwd(), 'build', nwBuildSettings.appName, platform, nwBuildSettings.appName + '.app', 'Contents', 'Resources', 'app.nw');
    }
    process.chdir(buildFolder);
}

function npmInstallBuildFolder () {
    exec('npm install');
}

function moveFilesIntoPackageNW () {
    if (process.platform !== 'darwin') {
        console.log(' ∙ Started moving files into package.nw');
        nwBuildSettings.files.forEach(function (file) {
            var src = file.replace('/**/*', '');
            var dest = path.join('package.nw', src);

            fs.moveSync(src, dest);
            console.log('  ∙ moved ' + src.replace('./', ''));
        });
        fs.moveSync('./node_modules', path.join('.', 'package.nw', 'node_modules'));
        console.log('  ∙ moved node_modules');
    }
}

function removeJunk () {
    console.log(' ∙ Started removing junk files');
    if (process.platform !== 'darwin') {
        junk.push('_style');
    }
    junk.forEach(function (item) {
        var file = path.join(process.cwd(), item);
        fs.removeSync(file);
        console.log('  ∙ deleted ' + item);
    });
}

function runApp () {
    if (platform === 'win32') {
        exec(nwBuildSettings.appName + '.exe');
    } else if (process.platform === 'darwin') {
        exec('open ' + nwBuildSettings.appName + '.app');
    } else {
        console.log('WARNING: WE STILL DON\'T KNOW HOW TO AUTO RUN EXE ON LINUX');
    }
}

function goUpOneDirectory () {
    process.chdir('..');
}

function renameBuiltFolder () {
    // win32 => Koa11y
    // linux64 => Koa11y
    fs.renameSync('./' + platform, './' + nwBuildSettings.appName);
}

function zipApp () {
    var zipExe = zip.path7za;
    var buildInput = '';
    var outputZip = '';
    var filename = nwBuildSettings.appName + '_' + nwBuildSettings.appVersion + '.zip';
    if (process.platform === 'win32') {
        buildInput = nwBuildSettings.appName;
        outputZip = path.join('WIN_' + filename);
    } else if (process.platform === 'darwin') {
        buildInput = path.join(nwBuildSettings.appName + '.app');
        outputZip = path.join('OSX_' + filename);
    } else if (process.platform === 'linux') {
        buildInput = path.join(nwBuildSettings.appName);
        if (process.arch === 'x64') {
            outputZip = path.join('LIN64_' + filename);
        } else if (process.arch === 'ia32' || process.arch === 'x86') {
            outputZip = path.join('LIN32_' + filename);
        }
    }

    fs.removeSync(outputZip);
    // a     = create archive
    // -bd   = do not display a progress bar in the CLI
    // -tzip = create a zip formatted file
    // -mx=9 = use maximum compression
    // -y    = auto answer yes to all prompts
    exec(zipExe + ' a -tzip -mx=9 -y "' + outputZip + '" "' + buildInput + '"');
}

function totalBuildTime () {
    var done = Date.now() - start;
    var time = Math.round(done / 1000);
    var minutes = Math.floor(time / 60);
    var seconds = time - (minutes * 60);
    seconds = (new Array(3).join('0') + seconds).slice(-2);

    var finalTime = minutes + ':' + seconds;
    var timeMinutes = '\nBuild took ' + finalTime;
    return timeMinutes;
}


// ///////////////////////// //
//           CLEAN           //
// ///////////////////////// //

fs.removeSync('./build');


// ///////////////////////// //
//         EXECUTION         //
// ///////////////////////// //

var nw = new NwBuilder(nwBuildSettings);


nw.on('log', function (msg) {
    console.log(msg);
});

nw.build().then(function () {
    console.log(' ∙ NW-Builder Complete');
    updateExe(function () {
        if (process.platform === 'win32') {
            console.log(' ∙ Updated ' + nwBuildSettings.appName + '.exe');
        }

        copyManifest();
        console.log(' ∙ Copied package.json');

        changeDirectoryToBuildFolder();
        console.log(' ∙ cd to build folder');

        npmInstallBuildFolder();
        console.log(' ∙ npm install build folder');

        moveFilesIntoPackageNW();
        console.log(' ∙ Finished moving files into package.nw');

        removeJunk();
        console.log(' ∙ Finished removing junk files');

        if (process.platform === 'darwin') {
            // go up 4 folders to get to the folder that holds YourAppName.app
            for (var i = 0; i < 4; i++) {
                goUpOneDirectory();
            }
            console.log(' ∙ Went up four directories');
        }

        runApp();
        console.log(' ∙ Ran app');

        if (process.platform !== 'darwin') {
            goUpOneDirectory();
            console.log(' ∙ Went up one directory');

            renameBuiltFolder();
            console.log(' ∙ Renamed built folder');
        }

        zipApp();
        console.log(' ∙ Zipped app');

        console.log(totalBuildTime());
    });
}).catch(function (err) {
    console.log('nw-builder err', err);
});
