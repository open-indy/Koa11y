window.deleteSettingsFile = function (bool) {
    if (!bool) {
        return;
    }

    var nw = require('nw.gui');
    var path = require('path');
    var fs = require('fs-extra');

    var settingsFile = path.join(nw.App.dataPath, 'koa11y-settings.json');

    fs.remove(settingsFile, function (err) {
        if (err) {
            console.log(err);
        } else {
            nw.Window.get().reload();
        }
    });
};
