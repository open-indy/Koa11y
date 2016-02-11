// Create a tray icon
var tray = new gui.Tray({
    icon : '../_img/icon16.png',
    title: 'App Tray'
});

//Give it a menu
var menu = new gui.Menu();
menu.append(new gui.MenuItem({
    type: 'checkbox',
    label: 'Are you sure?'
}));
tray.menu = menu;
