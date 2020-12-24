<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="listaArticulos"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
        :loading="cargando"
        loading-text="Cargando...Por favor espere"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Articulos</v-toolbar-title>
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
                  Agregar Articulo
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm6 md6>
                        <v-text-field
                          v-model="editedItem.codigo"
                          label="Código"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6 md6>
                        <v-select
                          v-model="categoria"
                          label="Categoría"
                          :items="listaCategorias"
                          item-text="nombre"
                          item-value="id"
                          return-object
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.nombre"
                          label="Artículo"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="editedItem.imagen"
                          label="Imagen"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-flex xs12 sm12 md12>
                      <v-textarea
                        v-model="editedItem.descripcion"
                        label="Descripción"
                        auto-grow
                        no-resize
                        counter="600"
                      ></v-textarea>
                    </v-flex>
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
                  Activar artículo
                </v-card-title>
                <v-card-title class="headline" v-else>
                  Desactivar artículo
                </v-card-title>
                <v-card-text>
                  Estás a punto de <span v-if="adAccion">activar </span>
                  <span v-else>desactivar </span> el artículo
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
          <v-btn color="primary" @click="listarArticulos">
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
  name: "TheArticle",
  data: () => ({
    dialog: false,
    headers: [
      { text: "ID", value: "id" },
      {
        text: "Artículo",
        align: "start",
        sortable: true,
        value: "nombre",
      },
      { text: "Código", value: "codigo" },
      { text: "Categoría", value: "categoria.nombre" },
      { text: "Descripción", value: "descripcion" },
      { text: "Estado", value: "estado" },
      { text: "Acciones", value: "actions", sortable: false },
    ],
    listaCategorias: [],
    listaArticulos: [],
    valida: false,
    validaCampo: [],
    adModal: false,
    adAccion: false,
    adNombre: "",
    categoria: "",
    search: "",
    cargando: true,
    editedIndex: -1,
    editedItem: {
      id: 0,
      nombre: "",
      codigo: "",
      categoria: {
        id: 0,
        nombre: "",
      },
      descripcion: "",
      imagen: "",
      estado: 1,
    },
    defaultItem: {
      id: 0,
      nombre: "",
      codigo: "",
      categoria: {
        id: 0,
        nombre: "",
      },
      descripcion: "",
      imagen: "",
      estado: 1,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Artículo" : "Editar Artículo";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.listarArticulos();
    this.listarCategorias();
  },

  methods: {
    async listarArticulos() {
      try {
        let response = await this.$http.get("/api/articulo/list", {
          headers: {
            token: this.$store.state.token,
          },
        });
        this.listaArticulos = response.data;
        this.cargando = false;
      } catch (error) {
        console.log(error);
      }
    },

    async listarCategorias() {
      try {
        let response = await this.$http.get("/api/categoria/list", {
          headers: {
            token: this.$store.state.token,
          },
        });
        this.listaCategorias = response.data;
      } catch (error) {
        console.log(error);
      }
    },

    validar() {
      this.valida = false;
      this.validaCampo = [];
      if (!this.categoria) {
        this.validaCampo.push("Seleccione una categoría");
      }
      if (
        this.editedItem.codigo.length < 4 ||
        this.editedItem.codigo.length > 10
      ) {
        this.validaCampo.push("El código debe tener entre 4 y 10 caracteres");
      }
      if (
        this.editedItem.nombre.length < 3 ||
        this.editedItem.nombre.length > 50
      ) {
        this.validaCampo.push(
          "El nombre del artículo debe tener entre 3-50 caracteres."
        );
      }
      if (
        this.editedItem.descripcion.length < 10 ||
        this.editedItem.descripcion.length > 600
      ) {
        this.validaCampo.push(
          "La descripción del artículo debe tener entre 10 y 600 caracteres."
        );
      }
      if (this.validaCampo.length) {
        this.valida = true;
      }
      return this.valida;
    },

    limpiar() {
      this.valida = 0;
      this.validaCampo = [];
    },

    editItem(item) {
      this.editedIndex = item.id;
      this.categoria = item ? item.categoria : "";
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
            "/api/articulo/deactivate",
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
            "/api/articulo/activate",
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
        this.listarArticulos();
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
        this.categoria = "";
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
              "/api/articulo/update",
              {
                nombre: this.editedItem.nombre,
                codigo: this.editedItem.codigo,
                imagen: this.editedItem.imagen,
                categoria: this.categoria.id,
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
              "/api/articulo/add",
              {
                nombre: this.editedItem.nombre,
                codigo: this.editedItem.codigo,
                imagen: this.editedItem.imagen,
                descripcion: this.editedItem.descripcion,
                categoriaId: this.categoria.id,
              },
              {
                headers: {
                  token: this.$store.state.token,
                },
              }
            );
          }
          this.listarArticulos();
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
