<template>
  <transition name="modal">
    <div class="modal" @click="$emit('close')">
      <div class="modal-dialog">
        <div class="modal-content" @click.stop>
          <div class="modal-header" v-if="this.$slots.header">
            <span class="glyphicon glyphicon-remove pull-right" @click="$emit('close')"></span>
            <slot name="header"></slot>
          </div>
          <div class="modal-body" v-if="this.$slots.body">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer" v-if="this.$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
</script>

<style></style>
