<template lang='pug'>
#app
  .column-1
    .bar
      select(v-model='example')
        option(v-for='opx, k of examples') {{k}}
    codemirror(v-model='code' :options='{mode: "wenyan"}' ref='cm1')
  .column-2
    .tabs
      .tab(@click='tab = 0' :class='{active: tab == 0}') Tokens ({{tokens.length}})
      .tab(@click='tab = 1' :class='{active: tab == 1}') AST
      .tab(@click='tab = 2' :class='{active: tab == 2}') Compiled
      .tab(@click='tab = 3' :class='{active: tab == 3}') {{error ? '⚠️' : ''}} Error

    .tab-contents
      .tab-content(v-show='tab === 0')
        json-viewer(:value='tokens' :expand-depth='2')
      .tab-content(v-show='tab === 1')
        json-viewer(:value='ast' :expand-depth='2')
      .tab-content.compiled(v-show='tab === 2')
        codemirror(:value='compiled' :options='{mode: "javascript", readOnly: true}' ref='cm2')
      .tab-content(v-show='tab === 3')
        pre.error-message {{errorText}}
</template>

<script lang='ts'>
import { ref, watch, onMounted } from '@vue/composition-api'
// @ts-ignore
import prettier from 'prettier/standalone'
// @ts-ignore
import parserBabylon from 'prettier/parser-babylon'
import { Compiler, Program, Token } from '../../core/src'
import { printError } from '../../cli/src/error-log'
import Examples from '../../examples/index'

export default {
  name: 'App',
  setup() {
    const code = ref('')
    const compiled = ref('')
    const example = ref('helloworld')
    const tab = ref(0)
    const ast = ref<Program>([])
    const tokens = ref<Token[]>([])
    const error = ref<Error | null>(null)
    const cm1 = ref<Vue>(null)
    const cm2 = ref<Vue>(null)
    const errorText = ref('')

    watch(code, () => {
      const compiler = new Compiler(code.value, {
        sourcemap: false,
      })
      try {
        compiler.run()
        tokens.value = compiler.tokens
        ast.value = compiler.ast
        compiled.value = prettier.format(compiler.compiled, {
          parser: 'babylon',
          plugins: [parserBabylon],
        })

        error.value = null
        errorText.value = ''
      }
      catch (e) {
        tokens.value = compiler.tokens || ['ERROR'] as any
        ast.value = compiler.ast || { message: 'ERROR' } as any
        compiled.value = `// ERROR: ${e}`
        error.value = e
        errorText.value = ''
        printError(e, (msg: any = '') => errorText.value += `${msg}\n`)
      }
    })

    watch(example, () => {
      code.value = Examples.examples[example.value as any] || ''
    })

    onMounted(() => {
      // @ts-ignore
      cm1.value.codemirror.setSize(null, '100%')
      // @ts-ignore
      cm2.value.codemirror.setSize(null, '100%')
    })

    return {
      code,
      compiled,
      ast,
      tokens,
      tab,
      error,
      errorText,
      cm1,
      cm2,
      example,
      examples: Examples.examples,
    }
  },
}
</script>

<style lang='stylus'>
$tabs-height = 40px
$border-color = #eee
$theme-color = #E53

html, body
  margin 0
  overflow hidden

#app
  font-family: sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  display grid
  grid-template-columns 50vw 50vw
  height 100vh
  overflow hidden

  .column-1
    display grid
    grid-template-rows $tabs-height auto
    height 100vh

    .bar
      height $tabs-height
      padding 0.6rem 1rem

    .vue-codemirror
      width 50vw
      overflow auto
      border-top 1px solid $border-color

  .column-2
    display grid
    grid-template-rows $tabs-height auto
    height 100vh
    border-left 1px solid $border-color

    .tabs
      height $tabs-height
      display grid
      grid-template-columns 1fr 1fr 1fr 1fr
      text-align center

      .tab
        font-size 0.9em
        height $tabs-height - 2px
        line-height $tabs-height
        cursor pointer
        transition background .2s ease-in-out
        border-bottom 2px solid transparent
        z-index 10

        &:hover
          background rgba(0,0,0,0.05)

        &.active
          color $theme-color
          border-color $theme-color

    .tab-contents
      border-top 1px solid $border-color
      height "calc(100vh - %s)" % ($tabs-height)
      overflow auto

      .tab-content.compiled,
      .compiled .vue-codemirror
        height 100%

      .error-message
        padding 10px
        margin 0

.jv-container
  font-size 11px !important

  .jv-code
    padding 10px 5px !important

  .jv-node
    margin-left 14px !important

  .jv-toggle
    opacity 0.2
    margin-right -10px !important
    transform translateX(-12px)

    &:hover
      opacity 0.8
</style>
