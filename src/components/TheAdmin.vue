<template>
  <v-app id="inspire">

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Sistema</v-toolbar-title>
      <v-spacer>
      </v-spacer>
        <v-btn
          icon
          class="mr-5"
          @click="salir()">
          <v-icon>mdi-logout</v-icon>
          <span>salir</span>
        </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-card class="mx-auto" width="300">
        <v-list>
          <v-list-item  @click="this.$store.dispatch('cambiarEstado',true)">
            <v-list-item-icon>
              <v-icon>mdi-home</v-icon>
            </v-list-item-icon>

            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>

          <v-list-group :value="false" prepend-icon="mdi-database">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Admin</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item v-for="([title, icon, ruta], i) in admins" :key="i" link :to="{name:ruta}">
              <v-list-item-title v-text="title"></v-list-item-title>

              <v-list-item-icon>
                <v-icon v-text="icon"></v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-group>

          <v-list-group :value="false" prepend-icon="mdi-account-supervisor" v-if="this.$store.state.user && this.$store.state.user.rol==='Administrador'">
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Permisos</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item v-for="([title, icon,ruta], i) in cruds" :key="i" link :to="{name:ruta}">
              <v-list-item-title v-text="title"></v-list-item-title>

              <v-list-item-icon>
                <v-icon v-text="icon"></v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-group>
        </v-list>
      </v-card>
    </v-navigation-drawer>

    <v-main class="grey lighten-2">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "TheAdmin",

  data: () => ({
    drawer: null,
    admins: [
      ["Categorías", "mdi-tag-text", "Categoria"],
      ["Artículos", "mdi-alpha-a-box", "Articulo"],
    ],
    cruds: [
      ["Usuarios", "mdi-plus-outline", "Usuario"],
    ],
  }),

  methods:{
    salir(){
      this.$store.dispatch('salir');
    }
  }
};
</script>
