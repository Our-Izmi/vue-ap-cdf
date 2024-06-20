<template>
  <component :is="activeRoute" :params="params"></component>
  <component :is="mainMenu" :menu="menus"></component>
  <component :is="configMenu" :menu="configMenus"></component>
  <FormLoader :active="loader" />
</template>

<script>
import { markRaw } from "vue";
import FormLoader from "@/components/template/FormLoader.vue";
import MainMenu from "@/views/template/MainMenuView.vue";
import ConfigMenu from "@/views/template/ConfigMenuView.vue";

const componentViews = import.meta.globEager("@/views/*.vue");
const componentPages = import.meta.globEager("@/views/pages/**/*.vue");
const componentAuth = import.meta.globEager("@/views/auth/*.vue");

let routeComponent = {};
Object.entries(componentViews).forEach((path, i) => {
  let name = path[0].split("/").pop().replace(".vue", "");
  routeComponent[name] = path[1].default;
});
Object.entries(componentPages).forEach((path, i) => {
  let name = path[0].split("/").pop().replace(".vue", "");
  routeComponent[name] = path[1].default;
});
Object.entries(componentAuth).forEach((path, i) => {
  let name = path[0].split("/").pop().replace(".vue", "");
  routeComponent[name] = path[1].default;
});

const currentUrl = window.location.pathname;

export default {
  components: {
    FormLoader,
  },
  data() {
    let routes = "";
    if (sessionStorage.getItem("page") != null && localStorage.getItem("user") != null) {
      routes = markRaw(routeComponent[sessionStorage.getItem("page")]);
    } else if (sessionStorage.getItem("page") == null && localStorage.getItem("user") != null) {
      routes = markRaw(routeComponent["DashboardView"]);
    } else if (localStorage.getItem("token") == null && currentUrl == "/verify") {
      routes = markRaw(routeComponent["VerifyView"]);
    } else if (currentUrl == "/privacy-policy") {
      routes = markRaw(routeComponent["PrivacyAndPolicy"]);
    } else {
      routes = markRaw(routeComponent["LoginView"]);
    }

    const user = JSON.parse(localStorage.getItem("user"));

    return {
      activeRoute: routes,
      mainMenu: markRaw(MainMenu),
      configMenu: markRaw(ConfigMenu),
      params: null,
      menus: routeComponent,
      loader: false,
      configMenus: routeComponent,
    };
  },

  mounted() {},
  created() {},
  methods: {
    goto: function (comp, p) {
      if (typeof p != "undefined") {
        this.params = p;
      }

      this.activeRoute = markRaw(routeComponent[comp]);
      sessionStorage.setItem("page", comp);
    },
  },
};
</script>

<style scoped>
.title {
  margin: 0;
  padding: 0px;
  font-size: 16px;
  color: #ffffff;
}

.my-notification {
  margin: 0 5px 5px;
  padding: 10px;
  font-size: 15px;
  color: #ffffff;

  background: #44a4fc;
  border-left: 5px solid #187fe7;

  &.success {
    background: #68cd86;
    border-left-color: #42a85f;
  }

  &.warn {
    background: #ffb648;
    border-left-color: #f48a06;
  }

  &.error {
    background: #e54d42;
    border-left-color: #b82e24;
  }
}
</style>
