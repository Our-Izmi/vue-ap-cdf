<template>
  <div id="container">
    <div class="body-container">
      <div class="login-title center">
        <img src="@/assets/img/logo_mtg.png" />
      </div>
      <div class="form-group">
        <input class="form-control" type="text" v-model="auth.username" placeholder="Nama Pengguna" />
      </div>
      <div class="form-group">
        <input class="form-control" type="text" v-if="showPassword" v-model="auth.password" placeholder="Kata Sandi" @keyup.enter="login" />
        <input class="form-control" type="password" v-else="password" v-model="auth.password" placeholder="Kata Sandi" @keyup.enter="login" />
        <a href="javascript:void(0)" v-if="showPassword" class="show-password" @click="show()">Hide Password</a>
        <a href="javascript:void(0)" v-else class="show-password" @click="show()">Show Password</a>
      </div>
      <div class="center">
        <button class="btn btn-primary" pe="button" @click="login">Masuk</button>
      </div>
    </div>
  </div>
</template>

<script>
import toast from "@/assets/js/toast";
import ApiService from "@/services/api/api.js";

export default {
  components: {},
  setup() {},
  data() {
    return {
      title: "Login Page",
      showPassword: false,
      auth: {
        username: null,
        password: null,
      },
    };
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (user && token) {
      this.goto("DashboardView");
    }
  },
  methods: {
    goto: function (comp) {
      if (localStorage.getItem("user") != null && localStorage.getItem("token") != null) {
        this.$root.goto(comp);
        sessionStorage.setItem("page", comp);
      } else {
        this.$root.goto("LoginView");
      }
    },
    show() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      try {
        if (!this.auth.username || !this.auth.password) {
          toast.warning("Username dan password harus diisi!");
        } else {
          this.$root.loader = true;
          const response = await ApiService.login(this.auth);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("token", response.data.token);
          location.reload();
        }
      } catch (error) {
        toast.warning("Login gagal!");
        console.error("Error fetching data:", error);
      } finally {
        this.$root.loader = false;
      }
    },
  },
};
</script>

<style scoped>
#container {
  display: flex;
  place-items: center;
  height: 100vh;
}

#container > * {
  max-width: 270px;
  margin: 0 auto;
  padding: 2em;
  background: var(--vt-color-step-950);
  box-shadow: 0 1em 4em var(--vt-color-step-100);
  border-radius: 2em;
}

.login-title {
  font-size: 24px;
}

.login-title img {
  width: 100px;
  height: auto;
}

.center {
  margin: 10px 0;
}

a {
  text-decoration: none;
}

.show-password {
  text-decoration: underline;
  display: block;
  text-align: right;
  font-size: 11px;
  margin: 2px 5px;
  background: none;
  color: black;
}
</style>
