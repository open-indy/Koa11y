var webPage = require('webpage');
var page = webPage.create();
var system = require('system');

if (system.args.length < 2) {
    // eslint-disable-next-line no-console
    console.log('No URL passed in.');
    // eslint-disable-next-line no-undef
    phantom.exit();
} else {
    var address = system.args[1];
    page.open(address, function (status) {
        if (status == 'success') {
            var data = page.evaluate(function () {
                var src = '';
                var alt = '';
                var output = '[';
                var imgs = document.getElementsByTagName('img');
                for (var i = 0; i < imgs.length; i++) {
                    var img = imgs[i];
                    if (i > 0) {
                        output = output + ', ';
                    }
                    src = img.src.split('\"').join('\\\"').split('\'').join('\\\'');
                    alt = img.alt.split('\"').join('\\\"').split('\'').join('\\\'');
                    output = output + '{ "src": "' + src + '", "alt": "' + alt + '" }';
                }
                output = output + ']';

                return output;
            });
            // eslint-disable-next-line no-console
            console.log(data);
            // eslint-disable-next-line no-undef
            phantom.exit();
        }
    });
}
