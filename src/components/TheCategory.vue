<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="listaCategorias"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
        :loading="cargando"
        loading-text="Cargando...Por favor espere"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Categorías</v-toolbar-title>
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
                  Agregar Categoria
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="editedItem.nombre"
                          label="Categoria"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="editedItem.descripcion"
                          label="Descripcion"
                          auto-grow
                          no-resize
                          counter="250"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-flex xs12 sm12 md12 v-show="valida">
                      <v-alert dense outlined type="error" v-for="v in validaCampo"
                        :key="v">
                        {{v}}
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
                  Activar categoría
                </v-card-title>
                <v-card-title class="headline" v-else>
                  Desactivar categoría
                </v-card-title>
                <v-card-text>
                  Estás a punto de <span v-if="adAccion">activar </span>
                  <span v-else>desactivar </span> la categoría
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
        <template v-slot:[`item.estado`]="{ item }">
          <div v-if="item.estado">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Inactivo</span>
          </div>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listar">
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
  name: "TheCategory",
  data: () => ({
    dialog: false,
    adModal: false,
    adAccion: false,
    adNombre: "",
    headers: [
      { text: "ID", value: "id" },
      {
        text: "Categoría",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      { text: "Descripción", value: "descripcion" },
      { text: "Estado", value: "estado" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    listaCategorias: [],
    cargando: true,
    search: "",
    valida: 0,
    validaCampo: [],
    editedIndex: -1,
    editedItem: {
      id: "",
      nombre: "",
      descripcion: "",
      estado: 1,
    },
    defaultItem: {
      id: "",
      nombre: "",
      descripcion: "",
      estado: 1,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nueva Categoria" : "Editar Categoria";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.listar();
  },

  methods: {
    async listar() {
      try {
        let response = await this.$http.get("/api/categoria/list", {
          headers: {
            token: this.$store.state.token,
          },
        });
        this.listaCategorias = response.data;
        this.cargando = false;
      } catch (error) {
        console.log(error);
      }
    },
    validar() {
      this.valida = 0;
      this.validaCampo = [];
      if (this.editedItem.nombre.length < 3 || this.editedItem.nombre > 50) {
        this.validaCampo.push(
          "El nombre de la categoria debe tener entre 3-50 caracteres"
        );
      }
      if (
        this.editedItem.descripcion.length < 10 ||
        this.editedItem.descripcion.length > 250
      ) {
        this.validaCampo.push(
          "La descripción de la categoría debe tener entre 10-250 caracteres"
        );
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
            "/api/categoria/deactivate",
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
            "/api/categoria/activate",
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
        this.listar();
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
              "/api/categoria/update",
              {
                nombre: this.editedItem.nombre,
                descripcion: this.editedItem.descripcion,
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
              "/api/categoria/add",
              {
                nombre: this.editedItem.nombre,
                descripcion: this.editedItem.descripcion,
              },
              {
                headers: {
                  token: this.$store.state.token,
                },
              }
            );
          }
          this.listar();
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
