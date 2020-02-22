import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
// @ts-ignore
import VueCodemirror from 'vue-codemirror'
import App from './App.vue'
import TokenViewer from './TokenViewer.vue'
import AstViewer from './AstViewer.vue'

import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/mode/simple'
import '@wenyanlang/highlight/codemirror.js'
import '@wenyanlang/highlight/wenyan-light.codemirror.css'

Vue.config.productionTip = false
Vue.use(VueCompositionApi)
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
Vue.component('AstViewer', AstViewer)
Vue.component('TokenViewer', TokenViewer)

new Vue({
  render: h => h(App),
}).$mount('#app')
