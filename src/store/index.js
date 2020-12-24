import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
      token:"",
      user:null,
  },
  mutations: {
      setUsuario(state, usuario){
          state.user= usuario;
      },
      setToken(state,token){
          state.token= token;
      },
  },
  actions:{
    guardarToken({commit},token){
        commit("setToken",token);
        commit("setUsuario",jwtDecode(token));
        localStorage.setItem("jwt",token);

    },
    autoLogin({commit}){
        const token = localStorage.getItem("jwt");
        if(token!=="null" && token!==null){
            commit("setToken",token);
            commit("setUsuario",jwtDecode(token));
        }
    },
    salir({commit}){
        commit("setToken",null);
        commit("setUsuario",null);
        localStorage.setItem("jwt",null);
        router.push({name:"Home"});
    }
  }
})

export default store