import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";

import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      public: true,
    },
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
    meta: {
      public: true,
    },
  },

  {
    path: "/login",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
    meta: {
      public: true,
    },
  },

  {
    path: "/admin",
    name: "Admin",
    component: () =>
      import(/* webpackChunkName: "admin" */ "../views/Admin.vue"),
    meta: {
      auth: true,
      Administrador: true,
      Vendedor: true,
      Almacenero: true,
    },
    children: [
      {
        path: "categoria",
        name: "Categoria",
        component: () =>
          import(/* webpackChunkName: "categoria" */ "../views/Categoria.vue"),
        meta: {
          auth: true,
          Administrador: true,
          Vendedor: false,
          Almacenero: true,
        },
      },
      {
        path: "usuario",
        name: "Usuario",
        component: () =>
          import(/* webpackChunkName: "usuario" */ "../views/Usuario.vue"),
        meta: {
          auth: true,
          Administrador: true,
          Vendedor: false,
          Almacenero: false,
        },
      },
      {
        path: "articulo",
        name: "Articulo",
        component: () =>
          import(/* webpackChunkName: "articulo" */ "../views/Articulo.vue"),
        meta: {
          auth: true,
          Administrador: true,
          Vendedor: false,
          Almacenero: true,
        },
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  store.dispatch("autoLogin");
  if (to.matched.some((record) => record.meta.public)) {
    if (to.name === "Login" && store.state.user) {
      next({ name: "Admin" });
    } else {
      next();
    }
  } else if (
    to.matched.some((record) => record.meta.auth) &&
    store.state.user
  ) {
    if (
      to.matched.some(
        (record) =>
          record.meta.Administrador &&
          store.state.user &&
          store.state.user.rol === "Administrador"
      )
    ) {
      next();
    } else if (
      to.matched.some(
        (record) =>
          record.meta.Vendedor &&
          store.state.user &&
          store.state.user.rol === "Vendedor"
      )
    ) {
      next();
    } else if (
      to.matched.some(
        (record) =>
          record.meta.Almacenero &&
          store.state.user &&
          store.state.user.rol === "Almacenero"
      )
    ) {
      next();
    }
  } else {
    next({ name: "Login" });
  }
});

export default router;
