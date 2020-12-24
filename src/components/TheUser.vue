<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="listaUsuarios"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
        :loading="cargando"
        loading-text="Cargando...Por favor espere"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Usuarios</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Agregar Usuario
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md6>
                        <v-text-field
                          v-model="editedItem.email"
                          label="Correo"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md6>
                        <v-select
                          v-model="rol"
                          label="Rol"
                          :items="listaRoles"
                          item-text="rol"
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.password"
                          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                          :rules="[rules.required, rules.min]"
                          :type="show1 ? 'text' : 'password'"
                          name="input-10-1"
                          label="Contraseña"
                          hint="Al menos 8 caracteres"
                          counter
                          @click:append="show1 = !show1"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-flex xs12 sm12 md12 v-show="valida">
                      <v-alert
                        dense
                        outlined
                        type="error"
                        v-for="v in validaCampo"
                        :key="v"
                      >
                        {{ v }}
                      </v-alert>
                    </v-flex>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" dark @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="primary" dark @click="save">
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="adModal" max-width="500px">
              <v-card>
                <v-card-title class="headline" v-if="adAccion">
                  Activar usuario
                </v-card-title>
                <v-card-title class="headline" v-else>
                  Desactivar usuario
                </v-card-title>
                <v-card-text>
                  Estás a punto de <span v-if="adAccion">activar </span>
                  <span v-else>desactivar </span> el usuario
                  {{ adNombre }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="closeChangeEstado()"
                    :color="adAccion ? 'orange darken-4' : 'green darken-4'"
                  >
                    Cancelar
                  </v-btn>
                  <v-btn
                    v-if="adAccion"
                    @click="changeEstadoConfirm()"
                    color="green darken-4"
                  >
                    Activar
                  </v-btn>
                  <v-btn
                    v-else
                    @click="changeEstadoConfirm()"
                    color="orange darken-4"
                  >
                    Desactivar
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            mdi-pencil
          </v-icon>
          <v-icon medium v-if="item.estado" @click="changeEstado(false, item)">
            mdi-toggle-switch
          </v-icon>
          <v-icon medium v-else @click="changeEstado(true, item)">
            mdi-toggle-switch-off-outline
          </v-icon>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listarUsuarios">
            Recargar
          </v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";

export default {
  name: "TheUser",
  data: () => ({
    dialog: false,
    adModal: false,
    adAccion: false,
    listaRoles: ["Administrador", "Vendedor", "Almacenero"],
    rol: "",
    adNombre: "",
    headers: [
      { text: "ID", value: "id" },
      {
        text: "Nombre",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      { text: "Rol", value: "rol" },
      { text: "Correo", value: "email" },
      { text: "Estado", value: "estado" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    listaUsuarios: [],
    cargando: true,
    search: "",
    valida: 0,
    validaCampo: [],
    editedIndex: -1,
    editedItem: {
      id: "",
      nombre: "",
      email: "",
      rol: "",
      password: "",
      estado: 1,
    },
    defaultItem: {
      id: "",
      nombre: "",
      email: "",
      rol: "",
      password: "",
      estado: 1,
    },
    show1: false,
    rules: {
      required: (value) => !!value || "Obligatorio.",
      min: (v) => v.length >= 8 || "Minimo 8 caracteres",
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Usuario" : "Editar Usuario";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.listarUsuarios();
  },

  methods: {
    async listarUsuarios() {
      try {
        let response = await this.$http.get("/api/usuario/list", {
          headers: {
            token: this.$store.state.token,
          },
        });
        this.listaUsuarios = response.data;
        this.cargando = false;
      } catch (error) {
        console.log(error);
      }
    },

    validar() {
      this.valida = 0;
      this.validaCampo = [];
      if (this.editedItem.nombre.length < 3 || this.editedItem.nombre > 50) {
        this.validaCampo.push("El nombre debe tener entre 3-50 caracteres");
      }
      if (
        this.editedItem.email
          .trim()
          .match(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
          ) === null
      ) {
        this.validaCampo.push(
          "El email tiene un formato incorrecto: ex@abc.xyz"
        );
      }
      if (!this.rol) {
        this.validaCampo.push("Seleccione un rol");
      }
      if (this.editedItem.password.length < 8) {
        this.validaCampo.push("La contraseña debe tener al menos 8 caracteres");
      }
      if (this.validaCampo.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    limpiar() {
      this.valida = 0;
      this.validaCampo = [];
    },

    editItem(item) {
      this.editedIndex = item.id;
      this.rol = item ? item.rol : "";
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    changeEstado(accion, item) {
      this.editedIndex = item.id;
      this.editedItem = Object.assign({}, item);
      this.adModal = true;
      this.adNombre = item.nombre;
      this.adAccion = accion;
    },

    async changeEstadoConfirm() {
      try {
        if (this.editedItem.estado === 1) {
          let response = await this.$http.put(
            "/api/usuario/deactivate",
            {
              id: this.editedItem.id,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          );
        } else {
          let response = await this.$http.put(
            "/api/usuario/activate",
            {
              id: this.editedItem.id,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          );
        }
        this.listarUsuarios();
      } catch (error) {
        console.log(error);
      }
      this.closeChangeEstado();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
        this.rol = "";
        this.limpiar();
      });
    },

    closeChangeEstado() {
      this.adModal = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      try {
        if (!this.validar()) {
          if (this.editedIndex > -1) {
            let response = await this.$http.put(
              "/api/usuario/update",
              {
                nombre: this.editedItem.nombre,
                rol: this.rol,
                email: this.editedItem.email,
                password: this.editedItem.password,
                id: this.editedItem.id,
              },
              {
                headers: {
                  token: this.$store.state.token,
                },
              }
            );
          } else {
            let response = await this.$http.post(
              "/api/usuario/add",
              {
                nombre: this.editedItem.nombre,
                rol: this.rol,
                email: this.editedItem.email,
                password: this.editedItem.password,
              },
              {
                headers: {
                  token: this.$store.state.token,
                },
              }
            );
          }
          this.listarUsuarios();
          this.close();
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped></style>
