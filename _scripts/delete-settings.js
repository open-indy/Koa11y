window.deleteSettingsFile = function (bool) {
    var nw = require('nw.gui');
    var ugui = window.ugui;
    if (bool) {
        var path = require('path');
        var settingsFile = path.join(nw.App.dataPath, 'uguisettings.json');

        ugui.helpers.deleteAFile(settingsFile, function () {
            var win = nw.Window.get();
            win.reload();
        });
    }
};
