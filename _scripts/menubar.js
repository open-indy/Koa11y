//get node webkit GUI - WIN
var gui = require('nw.gui');

// get the window object
var win = gui.Window.get();
var menubar = new gui.Menu({
    type: 'menubar'
});

var file = new gui.Menu();
var subMenu = new gui.Menu();

file.append(new gui.MenuItem({
    label: 'Action 1',
    click: function() {
        alert('Action 1 Clicked');
    }
}));

file.append(new gui.MenuItem({
    label: 'Action 2',
    click: function() {
        alert('Action 2 Clicked');
    }
}));

subMenu.append(new gui.MenuItem({
    label: 'SubMenu Action 1',
    click: function() {
        alert('SubMenu Action 1 Clicked');
    }
}));

subMenu.append(new gui.MenuItem({
    label: 'SubMenu Action 2',
    click: function() {
        alert('SubMenu Action 2 Clicked');
    }
}));

menubar.append( new gui.MenuItem({ label: 'File', submenu: file })); //Win
//win.menu.insert(new gui.MenuItem({ label: 'File', submenu: file }), 1); //Mac - add the file menu to window/menu panel
file.append(new gui.MenuItem({ label: 'Sub Action Menu', submenu: subMenu })); //Win
//file.insert(new gui.MenuItem({ label: 'Sub Action Menu', submenu: subMenu })); //Mac

// add the menubar to window/menu panel
win.menu = menubar;
