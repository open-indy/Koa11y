function makeDesktopPath() {
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
    return myDesktopPath;
}

module.exports = makeDesktopPath;
