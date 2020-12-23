import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router';
import jwtDecode from 'jwt-decode';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
      token:"",
      user:null,
      estado:true,
  },
  mutations: {
      setUsuario(state, usuario){
          state.user= usuario;
      },
      setToken(state,token){
          state.token= token;
      },
      setEstado(state,estado){
        state.estado= estado;
    }

  },
  actions:{
    cambiarEstado({commit}){
        commit("setEstado",estado);
    },
    guardarToken({commit},token){
        commit("setToken",token);
        commit("setUsuario",jwtDecode(token));
        localStorage.setItem("jwt",token);

    },
    autoLogin({commit}){
        const token = localStorage.getItem("jwt");
        if(token!=="null"){
            commit("setToken",token);
            commit("setUsuario",jwtDecode(token));
            return true;
        }
        return false;
    },
    salir({commit}){
        commit("setToken",null);
        commit("setUsuario",null);
        commit("cambiarEstado",true);
        localStorage.setItem("jwt",null);
        router.push({name:"Home"});
    }
  }
})

export default store