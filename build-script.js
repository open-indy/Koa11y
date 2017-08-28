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
var platforms = [ process.platform ];

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
    platforms: platforms,
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
    'package.nw/node_modules/es6-promise/es6-promise.d.ts',
    '_style'
];


// ///////////////////////// //
//         FUNCTIONS         //
// ///////////////////////// //

function updateExe (done) {
    var executable = './build/' + nwBuildSettings.appName + '/win32/' + nwBuildSettings.appName + '.exe';

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
}

function copyManifest () {
    var manifest = fs.readJsonSync('./package.json');
    manifest.devDependencies = {};
    var output = JSON.stringify(manifest, null, 2);
    fs.writeFileSync('./build/' + nwBuildSettings.appName + '/win32/package.json', output);
}

function changeDirectoryToBuildFolder () {
    var buildFolder = path.join(process.cwd(), 'build/' + nwBuildSettings.appName + '/win32');
    process.chdir(buildFolder);
}

function npmInstallBuildFolder () {
    exec('npm install');
}

function moveFilesIntoPackageNW () {
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

function removeJunk () {
    console.log(' ∙ Started removing junk files');
    junk.forEach(function (item) {
        var file = path.join(process.cwd(), item);
        fs.removeSync(file);
        console.log('  ∙ deleted ' + item);
    });
}

function runApp () {
    exec(nwBuildSettings.appName + '.exe');
}

function goUpOneDirectory () {
    process.chdir('..');
}

function renameBuiltFolder () {
    fs.renameSync('./win32/', './' + nwBuildSettings.appName);
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
        buildInput = path.join('linux64');
        outputZip = path.join('LIN64_' + filename);
    }

    fs.removeSync(outputZip);
    // a     = create archive
    // -bd   = do not display a progress bar in the CLI
    // -tzip = create a zip formatted file
    // -mx=9 = use maximum compression
    // -y    = auto answer yes to all prompts
    exec(zipExe + ' a -tzip -mx=9 -y "' + outputZip + '" "' + buildInput) + '"';
    if (process.platform === 'linux') {
        buildInput = path.join('linux32');
        outputZip = path.join('LIN32_' + filename);
        fs.removeSync(outputZip);
        exec(zipExe + ' a -tzip -mx=9 -y ' + outputZip + ' ' + buildInput);
    }
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
//         EXECUTION         //
// ///////////////////////// //

var nw = new NwBuilder(nwBuildSettings);


nw.on('log', function (msg) {
    console.log(msg);
});

nw.build().then(function () {
    console.log(' ∙ NW-Builder Complete');

    updateExe(function () {
        console.log(' ∙ Updated ' + nwBuildSettings.appName + '.exe');

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

        runApp();
        console.log(' ∙ Ran app');

        goUpOneDirectory();
        console.log(' ∙ Went up one directory');

        renameBuiltFolder();
        console.log(' ∙ Renamed built folder');

        zipApp();
        console.log(' ∙ Zipped app');

        console.log(totalBuildTime());
    });
}).catch(function (err) {
    console.log('nw-builder err', err);
});
