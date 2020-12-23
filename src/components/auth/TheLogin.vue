<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6 lg5 x14>
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>
            Acceso al Sistema
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              prepend-icon="email"
              v-model="login.email"
              :rules="emailRules"
              label="Correo"
              required
            ></v-text-field>

            <v-text-field
              prepend-icon="lock"
              v-model="login.password"
              :rules="passwordRules"
              label="Contraseña"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-3 pb-3">
          <v-flex text-xs-right>
            <v-btn :disabled="!valid" color="success" @click="loginUser()">
              Iniciar sesión
            </v-btn>
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import swal from "sweetalert";

export default {
  data: () => ({
    valid: true,
    login: {
      email: "",
      password: "",
    },
    emailRules: [
      (v) => !!v || "Correo es obligatorio",
      (v) => /.+@.+\..+/.test(v) || "El correo debe ser válido",
    ],
    passwordRules: [
      (v) => !!v || "Contraseña es obligatoria",
      (v) =>
        (v && v.length >= 8) ||
        "La contraseña debe terner al menos 8 caracteres",
    ],
  }),

  methods: {
    // validate() {
    //   this.$refs.form.validate();
    // },
    async loginUser() {
      try {
        this.$refs.form.validate();
        console.log("fefe");
        let response = await this.$http.post("/api/usuario/login", this.login);
        let token = response.data.tokenReturn;
        if (token) {
          this.$store.dispatch("guardarToken", token);
          this.$router.push("/admin");
          swal("Bienvenido", "Hola " + response.data.user.nombre, "success");
        }
      } catch (err) {
          swal("Error", "Ocurrió un error con el servidor.", "error");
        
        this.login.email = "";
        this.login.password = "";
      }
    },
  },
};
</script>

<style scoped></style>
