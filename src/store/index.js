import { createStore } from "vuex";
export default createStore({
  state: {
    isCollapse: false,
  },
  mutations: {
    setIsCollapse(state) {
      state.isCollapse = !state.isCollapse;
    },
  },
});
