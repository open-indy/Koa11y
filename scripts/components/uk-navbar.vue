<template>
  <div>
  <nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
      <a class="uk-navbar-item uk-logo" href="#">
        <img src="../../img/logo.png" alt="Koa11y Koala Logo">
      </a>
      <ul class="uk-navbar-nav">

        <li v-for="item in items" @mouseEnter="showDropdown(item)" @mouseLeave="hideDropdown(item)" class="uk-active">
          <a href="#" @click="ukNavClick(item)">{{ item.name }}</a>
          <div v-if="item.sub" class="uk-navbar-dropdown" :style="dropDownVisible(item)">
            <ul class="uk-nav uk-navbar-dropdown-nav">

              <li v-for="subItem in item.sub" class="uk-active">
                <a href="#" @click="ukNavClick(subItem)">{{ subItem.name }}</a>
              </li>

            </ul>
          </div>
        </li>

      </ul>
    </div>
  </nav>
</div>
</template>

<script>
module.exports = {
  data: function () {
    return {
      items: [
        {
          name: 'File',
          showSub: false,
          sub: [
            {
              name: 'New'
            },
            {
              name: 'Exit'
            }
          ]
        },
        {
          name: 'About',
          showSub: false
        }
      ]
    };
  },
  methods: {
    ukNavClick: function (item) {
      var navItem = 'nav' + item.name.replace(/ /g, '').trim();
      this[navItem]();
    },
    navFile: function () {
      console.log('File');
    },
    navAbout: function () {
      console.log('About');
    },
    navNew: function () {
      console.log('New');
    },
    navExit: function () {
      nw.Window.get().close();
    },
    showDropdown: function (item) {
      if (item.sub) {
        item.showSub = true;
      }
    },
    hideDropdown: function (item) {
      item.showSub = false;
    },
    dropDownVisible: function (item) {
      var style = '';
      if (item.showSub) {
        style = 'display: block;';
      }
      return style;
    }
  }
};
</script>

<style>

</style>
