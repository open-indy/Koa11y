<template>
  <nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
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
        }
      ];
    };
  },
  methods: {
  }
};
</script>

<style>

</style>
