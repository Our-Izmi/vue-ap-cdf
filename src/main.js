import { createApp } from "vue";
import { createPinia } from "pinia";
import VueCoreUI from '@coreui/vue';
import { CIcon } from '@coreui/icons-vue';
import * as icons from '@coreui/icons';

import App from "./App.vue";

import "./assets/main.css";
import "vue3-toastify/dist/index.css";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.min";


const app = createApp(App);

app.use(createPinia());
app.use(VueCoreUI);
app.provide('icons', icons);
app.component('CIcon', CIcon);

app.mount("#app");
