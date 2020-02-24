<template lang="pug">
.viewer-switch
  div(v-show='!code')
    slot
  codemirror(v-show='code' :value='json' :options='{readOnly: true}' ref='cm')
  .toggle-button(@click='code = !code') {{ code ? 'Viewer' : 'JSON' }}
</template>

<script>
export default {
  props: {
    data: {
      type: [Object, Array],
      default: () => ({}),
    },
  },
  data() {
    return {
      code: false,
    }
  },
  computed: {
    json() {
      return this.code ? JSON.stringify(this.data, null, 2) : ''
    },
  },
  mounted() {
    this.$refs.cm.codemirror.setSize(null, '100%')
  },
}
</script>

<style lang="stylus" scoped>
.viewer-switch
  .toggle-button
    position absolute
    top 50px
    right 25px
    border 1px solid #ddd
    cursor pointer
    z-index 100
    padding 2px 8px
    border-radius 3px
    font-family monospace
    font-size 12px

    &:hover
      background #f5f5f5

</style>
