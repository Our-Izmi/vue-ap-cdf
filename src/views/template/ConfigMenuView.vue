<template>
  <div id="container" v-if="isLogin == 1">
    <ul>
      <template v-if="menu != null">
        <div class="dropdown">
          <div id="logo-container" class="collapsed" data-bs-toggle="dropdown" aria-expanded="true">
            <img src="@/assets/img/profile.png" />
          </div>
          <ul class="dropdown-menu">
            <div v-for="(menu, index) in menu" :key="index">
              <div v-if="menu.sub_menu_id == null">
                <li @click="this.$root.goto(menu.menu)">
                  <a class="dropdown-item">{{ menu.name }}</a>
                </li>
                <li @click="logout()"><a class="dropdown-item">Logout</a></li>
              </div>
            </div>
          </ul>
        </div>
      </template>
    </ul>
  </div>
</template>

<script>
import ApiService from "@/services/api/api.js";
export default {
  data() {
    return {
      menu: [
        {
          name: "Profile",
          menu: "DashboardView",
          sub_menu_id: null,
          sub_menu: [],
        },
      ],
      isLogin: localStorage.getItem("token") != null || localStorage.getItem("user") != null ? 1 : 0,
      activemenu: null,
    };
  },
  methods: {
    async logout() {
      try {
        const response = await ApiService.logout();
      } finally {
        localStorage.clear();
        window.location.reload();
      }
    },
    logged(e) {
      console.log(e);
    },
  },
};
</script>

<style scoped>
#container {
  text-transform: capitalize;
  cursor: pointer;
  min-width: 2em;
  position: absolute;
  top: 1em;
  right: 1em;
  /* background-color: red; */
  background-color: var(--vt-color-step-950);
  padding: 0.5em;
  border-radius: 0.8em;
  /* box-shadow: 0 .5em 1em var(--vt-color-step-800); */
  /* overflow: auto; */
  z-index: 100;
}

#container #logo-container {
  text-align: center;
}

#container #logo-container img {
  width: 3em;
  height: auto;
}

#container ul {
  margin: 0;
  padding: 0;
}

#container ul li {
  list-style: none;
  /* margin: .2em 0; */
  padding: 0.2em 0.4em;
  border-radius: 1em 0 0 1em;
  /* box-shadow: .4em .2em 1em var(--vt-color-step-800); */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.5s ease-out;
  /* background: rgb(183, 146, 255); */
  /* background: linear-gradient(130deg, rgba(183, 146, 255, 1) 76%, rgba(157, 118, 231, 1) 100%); */
  color: black;
  text-transform: capitalize;
  font-weight: 400;
}

#container ul li:hover {
  color: var(--vt-color-step-400);
  /* background-color: var(--vt-color-step-950); */
}

/* dropdown */
/* Style The Dropdown Button */
.dropbtn {
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  /* padding: .4em; */
  border-radius: 0.2em;
  margin-top: 1em;
  margin-right: -0.4em;
  right: 0;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {
  background-color: #f1f1f1;
}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {
  display: block;
}
</style>
