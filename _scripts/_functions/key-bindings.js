function keyBindings () {
    document.onkeydown = function (pressed) {
    // Check CMD+Shift+X and cut
    // Check CMD+Shift+V and paste
    // Check CMD+Shift+C and copy
        if (pressed.metaKey && pressed.keyCode === 88) {
            document.execCommand('cut');
            return false;
        } else if (pressed.metaKey && pressed.keyCode === 67) {
            document.execCommand('copy');
            return false;
        } else if (pressed.metaKey && pressed.keyCode === 86) {
            document.execCommand('paste');
            return false;
        }
    };
}
module.exports = keyBindings;
