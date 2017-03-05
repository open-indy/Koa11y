// Image Alts Script v5

console.clear();

var img = document.getElementsByTagName('img');
var imgs = '[';

for (var i = 0, image; i < img.length; i++) {
    image = '{\"src\":\"' + img[i].src + '\",\"alt\":\"' + img[i].alt + '\"}';
    if (i !== img.length - 1) {
        image = image + ',';
    }
    imgs = imgs + image;
}

imgs = imgs + ']';

console.log(imgs);
var dummy = document.createElement('textarea');
dummy.setAttribute('id', 'dummy');
document.body.appendChild(dummy);
var dumNode = document.getElementById('dummy');
dumNode.value = imgs;
dumNode.select();
document.execCommand('copy');
document.body.removeChild(dumNode);
console.log('The above code has been copied to your clipboard');

// JSON.parse(imgs); To convert it to something useful
