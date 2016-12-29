# UGUI: Pa11y

### Check if a website has accessibility issues.

<p align="center"><img src="http://thejaredwilcurt.github.io/UGUI-pa11y/_img/screenshot.png" alt="Screenshot of UGUI: Pa11y"></p>

To download UGUI: Pa11y, visit the website:

* http://TheJaredWilcurt.github.io/UGUI-pa11y

* * *

## To run source code locally

1. Install [Node](http://nodejs.org) (V4.0.0 or above)
2. Download or clone this repo
3. Run `npm install`
4. Run `npm start`

### There are multiple ways to access the dev tools locally.

Do any of the following:

* Edit the `package.json` to have `toolbar: true`. Launch the app and click the button in the toolbar.
* To auto launch the dev tools with the app, uncomment this line in `_scripts\app.js`
  * `require('nw.gui').Window.get().showDevTools();`
* In the `index.html` change the `body` class from `prod` to `dev`. Launch the app and press `F12` or `Ctrl+Shift+I`
