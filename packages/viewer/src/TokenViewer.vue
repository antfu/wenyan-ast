<template lang="pug">
.token-viewer.viewer
  .token(
    v-for='(token, idx) in tokens'
    :key='idx'
    @mouseover="$emit('mouseover', token.loc)"
    @mouseleave="$emit('mouseleave', token.loc)"
  )
    span.bracket {
    span.type(:class='token.type') {{token.type}}
    span.comma ,
    span.value(:class='[typeof token.value]') {{token.value}}
    span.bracket }
</template>

<script>
export default {
  props: {
    tokens: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style lang="stylus" scoped>
.token-viewer
  padding 10px 3px
  color: #111111
  font-size: 12px

  .token
    font-family: Consolas, Menlo, Courier, monospace
    padding 4px 10px
    cursor default
    transition all .1s ease-in
    border-radius 3px

    &:hover
      background rgba(0,0,0,0.05)

    span
      padding-right 5px

    .bracket, .comma
      opacity 0.3
</style>
