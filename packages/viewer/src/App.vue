<template lang='pug'>
#app
  .column-1
    .bar
      select(v-model='example')
        option(v-for='v, k of examples' :value='k') {{v.name || k}}
    codemirror(v-model='code' :options='{mode: "wenyan"}' ref='cm1')
  .column-2
    .tabs
      .tab(@click='tab = 0' :class='{active: tab == 0}') Tokens ({{tokens.length}})
      .tab(@click='tab = 1' :class='{active: tab == 1}') AST
      .tab(@click='tab = 2' :class='{active: tab == 2}') Compiled
      .tab(@click='tab = 3' :class='{active: tab == 3}') {{error ? '⚠️' : ''}} Error

    .tab-contents
      .tab-content(v-show='tab === 0')
        viewer-switch(:data='tokens')
          token-viewer(
            :tokens='tokens'
            @mouseover='highlight'
            @mouseleave='clearHighlight'
          )
      .tab-content(v-show='tab === 1')
        viewer-switch(:data='ast')
          ast-viewer(
            :node='ast'
            :expanded='true'
            @mouseover='highlight'
            @mouseleave='clearHighlight'
          )
      .tab-content.compiled(v-show='tab === 2')
        codemirror(:value='compiled' :options='{mode: "javascript", readOnly: true}' ref='cm2')
      .tab-content(v-show='tab === 3')
        pre.error-message {{errorText}}
</template>

<script lang='ts'>
/* eslint-disable no-unused-expressions */
import { ref, watch, onMounted } from '@vue/composition-api'
// @ts-ignore
import prettier from 'prettier/standalone'
// @ts-ignore
import parserBabylon from 'prettier/parser-babylon'
import { useStoragePlain } from '@vueuse/core'
import { Compiler, Program, Token, SourceLocation, createContext } from '../../compiler/src'
import { printError } from '../../cli/src/error-log'
import examples from '../../examples'

export default {
  name: 'App',
  setup() {
    const code = useStoragePlain('wenyan-parser-viewer-code', '')
    const compiled = ref('')
    const example = useStoragePlain('wenyan-parser-viewer-example', 'helloworld')
    const tab = ref(0)
    const ast = ref<Program>([])
    const tokens = ref<Token[]>([])
    const error = ref<Error | null>(null)
    const cm1 = ref<Vue>(null)
    const cm2 = ref<Vue>(null)
    const errorText = ref('')
    let textMarker: any
    let errorMarker: any

    const run = () => {
      console.clear()
      // @ts-ignore
      errorMarker?.clear()

      const compiler = new Compiler(
        createContext(code.value),
        {
          sourcemap: true,
        })
      try {
        // @ts-ignore
        window.context = compiler.context
        compiler.run()
        tokens.value = compiler.tokens
        ast.value = compiler.ast
        compiled.value = prettier.format(compiler.compiled, {
          parser: 'babel',
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

        if (e.loc) {
          // @ts-ignore
          errorMarker = cm1.value?.codemirror.markText({
            line: e.loc.start.line - 1,
            ch: e.loc.start.column,
          }, {
            line: e.loc.end.line - 1,
            ch: e.loc.end.column,
          }, {
            className: 'token-error',
          })
        }

        printError(e, (msg: any = '') => errorText.value += `${msg}\n`)
      }
    }

    watch(code, run, { lazy: true })

    watch(example, () => {
      code.value = examples[example.value as any]?.code || ''
    }, { lazy: true })

    onMounted(() => {
      // @ts-ignore
      cm1.value.codemirror.setSize(null, '100%')
      // @ts-ignore
      cm2.value.codemirror.setSize(null, '100%')

      run()
    })

    const highlight = ({ start, end }: SourceLocation) => {
      // @ts-ignore
      textMarker?.clear()
      // @ts-ignore
      textMarker = cm1.value.codemirror.markText({
        line: start.line - 1,
        ch: start.column,
      }, {
        line: end.line - 1,
        ch: end.column,
      }, {
        className: 'token-highlighted',
      })
    }

    const clearHighlight = () => {
      // @ts-ignore
      textMarker?.clear()
    }

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
      examples,
      highlight,
      clearHighlight,
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

.token-highlighted
  background #42b98330
  margin -1px
  border-radius 3px
  border 1px solid #42b98350

.token-error
  background url("https://raw.githubusercontent.com/jwulf/typojs-project/master/public/images/red-wavy-underline.gif") bottom repeat-x

.viewer
  color: #111111
  font-size: 12px
  font-family: Consolas, Menlo, Courier, monospace

  .value.string
    color #42b983

    &:before, &:after
      content '"'

  .value.number, .value.boolean
    color: #fc1e70

  .value.undefined
    color #e08331

    &:before
      content 'undefined'
</style>
