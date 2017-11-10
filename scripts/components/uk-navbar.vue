<template>
  <div>
  <nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
      <a class="uk-navbar-item uk-logo" href="#">
        <img src="../../img/logo.png" alt="Koa11y Koala Logo">
      </a>
      <ul class="uk-navbar-nav">

        <li v-for="item in items" class="uk-active">
          <a href="#" @hover="item.showSub = true">{{ item.name }}</a>
          <div v-if="item.sub" class="uk-navbar-dropdown">
            <ul class="uk-nav uk-navbar-dropdown-nav">

              <li v-for="subItem in item.sub" class="uk-active">
                <a href="#">{{ subItem.name }}</a>
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
          name: 'About'
        }
      ]
    };
  },
  methods: {
  }
};
</script>

<style>

</style>
