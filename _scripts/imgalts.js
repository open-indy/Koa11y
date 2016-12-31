// Image Alts Script v4

console.clear();

window.xhrWorked = true;
var xhr = new XMLHttpRequest();
var img = document.getElementsByTagName('img');
// Number of images on the page
var imgLen = img.length;
var altLen = 0;
var bigAlt = imgLen;
var bigImg = imgLen;
var imgErr = 0;
var imgSizes = 0;
var missedImg = 0;
var imgAlts = [];
var i = 0;
if (imgLen < 1) {
    console.log('No images found on this page.');
} else {
    for (i = 0; i < imgLen; i++) {
        if (img[i].getAttribute('alt')) {
            imgAlts.push(img[i]);
        }
        try {
            // Make a Synchronous call to get the current image
            xhr.open('HEAD', img[i].getAttribute('src'), false);
            // When the image requested is ready
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        // Filesize
                        var size = xhr.getResponseHeader('Content-Length');
                        size = parseInt(size);
                        if (!isNaN(size)) {
                            // Add the size to the total size of all images thus far
                            imgSizes = imgSizes + size;
                            // If the current image is over 100KB
                            if (size > 102400) {
                                // Lower the score of bigImg from 100%
                                bigImg--;
                            }
                        } else {
                            // Refused to get unsafe header "Content-Length"
                            // xhr.onreadystatechange
                            // Because page was https, and our xhr was http, the size came back null
                            missedImg = missedImg + 1;
                        }
                    // Otherwise there was an error getting the image
                    } else {
                        imgErr++;
                    }
                }
            };
            xhr.send(null);
        } catch (err) {
            window.xhrWorked = false;
        }
    }
    for (var j = 0; j < imgAlts.length; j++) {
        var currentAlt = imgAlts[j].getAttribute('alt');
        // if the alt tag is longer than 100 chars
        if (currentAlt.length > 100) {
            // lower it's score from 100%
            bigAlt--;
        }
        var descriptive = confirm('Is this text descriptive: (' + j + '/' + imgAlts.length + ')\n' + currentAlt);
        if (descriptive) {
            // increase the alt tag count
            altLen++;
        }
    }

    var altPercent = Math.round((altLen / imgLen) * 100);
    var under100KB = '?';
    var failPercent = '?';
    var sizeUnder100 = '?';
    var loaded = '?';
    var KB = '?';
    var good = 'text-success glyphicon-ok';
    var bad = 'text-danger glyphicon-remove';
    var warn = 'text-warning glyphicon-ban-circle';
    var altIcon = good;
    var lengthIcon = good;
    var sizeIcon = warn;
    var errorIcon = warn;
    var missImgWarn = '';
    var testable = '';
    if (missedImg > 0) { missImgWarn = ' title="Could not verify ' + missedImg + ' images."'; }
    if (missedImg == 1) { missImgWarn = ' title="Could not verify ' + missedImg + ' image."'; }
    if (altPercent < 100) { altIcon = bad; }
    if (bigAlt > imgLen) { lengthIcon = bad; }
    if (imgErr > 0) { errorIcon = bad; }
    // Ideally this only gets hit if the XHR was successfull;
    if (bigAlt > 0 && window.xhrWorked) {
        sizeIcon = good;
        if (bigImg > 0) { sizeIcon = bad; }
        errorIcon = good;
        sizeUnder100 = bigImg;
        loaded = imgLen - imgErr;
        KB = (Math.round((imgSizes / 1024) * 10) / 10);
        under100KB = Math.round((bigImg / imgLen) * 100);
        failPercent = Math.round(((imgLen - imgErr) / imgLen) * 100);
        if (under100KB == 100) { sizeIcon = good; }
        if (missedImg > 0) {
            sizeIcon = warn;
            loaded = loaded - missedImg;
            sizeUnder100 = sizeUnder100 - missedImg;
            testable = 'testable ';
        }
        if (missedImg > 0 && errorIcon == good) { errorIcon = warn; }
    }
    var lastTwo =
        '      <p><i class="glyphicon ' + sizeIcon + '"' + missImgWarn + '></i> <strong>' + under100KB + '%</strong> of ' + testable + 'images were under 100KB in size. <strong>(' + sizeUnder100 + '/' + imgLen + ')</strong></p>\r\n' +
        '      <p><i class="glyphicon ' + errorIcon + '"' + missImgWarn + '></i> <strong>' + failPercent + '%</strong> of ' + testable + 'images loaded with a total image payload of <strong>' + KB + 'KB (' + loaded + '/' + imgLen + ')</strong></p>\r\n';
    if (under100KB == '?' && failPercent == '?' && sizeUnder100 == '?' && KB == '?' && loaded == '?') {
        lastTwo = '      <p><i class="glyphicon ' + warn + '"></i> The requested URL blocks cross-origin resource sharing of images (CORS), so we couldn\'t verify the image file sizes.</p>\r\n';
    }
    console.clear();
    var output =
        '<div class="row">\r\n' +
        '  <div class="panel panel-primary">\r\n' +
        '    <div class="panel-heading">Image Accessibility</div>\r\n' +
        '    <div class="panel-body">\r\n' +
        '      <p><i class="glyphicon ' + altIcon + '"></i> <strong>' + altPercent + '%</strong> of images on the page had descriptive ALT text. <strong>(' + altLen + '/' + imgLen + ')</strong></p>\r\n' +
        '      <p><i class="glyphicon ' + lengthIcon + '"></i> <strong>' + Math.round((bigAlt / imgLen) * 100) + '%</strong> of ALTs were under 100 characters. <strong>(' + bigAlt + '/' + imgLen + ')</strong></p>\r\n' +
               lastTwo +
        '    </div>\r\n' +
        '  </div>\r\n' +
        '</div>';
    console.log(output);
    var dummy = document.createElement('textarea');
    dummy.setAttribute('id', 'dummy');
    document.body.appendChild(dummy);
    var dumNode = document.getElementById('dummy');
    dumNode.value = output;
    dumNode.select();
    document.execCommand('copy');
    document.body.removeChild(dumNode);
    console.log('The above code has been copied to your clipboard');
}
