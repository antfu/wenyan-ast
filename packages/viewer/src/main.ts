import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
// @ts-ignore
import VueCodemirror from 'vue-codemirror'
// @ts-ignore
import JsonViewer from 'vue-json-viewer'
import App from './App.vue'

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/mode/simple'
import '@wenyanlang/highlight/codemirror.js'
import '@wenyanlang/highlight/wenyan-light.codemirror.css'

Vue.config.productionTip = false
Vue.use(VueCompositionApi)
Vue.use(JsonViewer)
Vue.use(VueCodemirror, {
  options: {
    theme: 'wenyan-light',
    tabSize: 2,
    mode: 'wenyan',
    line: true,
    lineNumbers: true,
    indentWithTabs: true,
  },
})

new Vue({
  render: h => h(App),
}).$mount('#app')
