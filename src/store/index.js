import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    confGlobal: {}, //整个表单配置
  },
  mutations: {
    setConfGlobal(state, val) {
      state.confGlobal = val;
    },
  }
})
