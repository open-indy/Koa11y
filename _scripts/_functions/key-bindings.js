function keyBindings () {
    if (process.platform === 'darwin') {
        document.onkeydown = function (pressed) {
            let command = pressed.metaKey;
            let keyC = pressed.keyCode === 67;
            let keyV = pressed.keyCode === 86;
            let keyX = pressed.keyCode === 88;

            if (command && keyX) {
                document.execCommand('cut');
                return false;
            } else if (command && keyC) {
                document.execCommand('copy');
                return false;
            } else if (command && keyV) {
                document.execCommand('paste');
                return false;
            }
        };
    }
}

module.exports = keyBindings;
