<template lang="pug">
.ast-viewer.viewer(
  :class='{ hover }'
)
  .type(
    @click='i_expanded = !i_expanded'
    @mouseover='mouseover'
    @mouseleave='mouseleave'
  ) {{node.type}}
    .dots(v-if='!i_expanded') ...

  .field(
    v-if='i_expanded'
    v-for='value, key in node'
    :key='key'
  )
    template(v-if='key !== "loc" && key !== "type"')
      .key {{key}}
      template(v-if='Array.isArray(value) && typeof value[0] === "object"')
        .viewer-array
          ast-viewer(
            v-for='(item, idx) in value'
            :key='idx'
            :node='item'
            :depth='depth+1'
            @mouseover='passover'
            @mouseleave='passleave'
          )
      template(v-else-if='Array.isArray(value)')
        .value.array(:class='[typeof value]') {{value}}
      template(v-else-if='typeof value === "object"')
        ast-viewer(
          :node='value'
          :depth='depth+1'
          @mouseover='passover'
          @mouseleave='passleave'
        )

      template(v-else)
        .value(:class='[typeof value]') {{value}}
</template>

<script lang='js'>
export default {
  props: {
    node: {
      type: Object,
      default: () => ({}),
    },
    depth: {
      type: Number,
      default: 0,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      hover: false,
      i_expanded: false,
    }
  },
  computed: {
    depthClass() {
      return `depth-${this.depth}`
    },
  },
  watch: {
    hover(v) {
      if (!this.node.loc)
        return
      if (v)
        this.$emit('mouseover', this.node.loc)
      else
        this.$emit('mouseleave', this.node.loc)
    },
    expanded: {
      immediate: true,
      handler() {
        this.i_expanded = this.expanded
      },
    },
  },
  methods: {
    mouseover(e) {
      this.hover = true
    },
    mouseleave() {
      this.hover = false
    },
    passover(loc) {
      this.$emit('mouseover', loc)
    },
    passleave(loc) {
      this.$emit('mouseleave', loc)
    },
  },
}
</script>

<style lang="stylus" scoped>
.ast-viewer
  cursor default
  white-space nowrap
  line-height 18px
  padding 10px 15px

  .type
    color #cc4021
    cursor pointer
    font-style: italic

    .dots
      display inline
      color black
      background #ddd
      opacity 0.2
      padding 0 4px
      border-radius 2px
      margin-left 6px
      font-style normal

  .ast-viewer
    margin-left 18px
    padding 0

  &.hover
    background rgba(0,0,0,0.03)

  .field
    border-left 1px solid #f5f5f5dd
    margin-left 1px

    .key, .value
      display inline-block
      vertical-align top

    .key
      padding-right 5px
      padding-left 10px
      opacity 0.4

      &:after
        content ':'
        opacity 0.5

</style>
