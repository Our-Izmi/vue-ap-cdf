<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader class="d-flex justify-content-between align-items-center">
        <strong>Approval</strong>
        <CButton
          v-c-tooltip="{ content: 'Tambah Approval', placement: 'top' }"
          @click="
            () => {
              openNewApv();
              modal.action = 1;
            }
          "
          color="success"
        >
          <CIcon icon="cil-note-add" width="24" height="24" />
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CAlert
          class="d-flex align-items-center"
          :color="alert.color"
          :visible="alert.visibleOnMain"
          dismissible
          @close="
            () => {
              alert.visibleOnMain = false;
            }
          "
        >
          <CIcon v-if="alert.color == 'warning'" icon="cil-warning" class="flex-shrink-0 me-2" width="24" height="24" />
          <CIcon v-if="alert.color == 'success'" icon="cil-check-circle" class="flex-shrink-0 me-2" width="24" height="24" />
          <CIcon v-if="alert.color == 'danger'" icon="cil-x-circle" class="flex-shrink-0 me-2" width="24" height="24" />
          <div>
            <strong>{{ alert.title }}</strong> {{ alert.message }}
          </div>
        </CAlert>
        <CRow>
          <CCol md="12" class="mb-3">
            <CInputGroup>
              <CInputGroupText>Data</CInputGroupText>
              <CFormSelect v-model="filter.perPage">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
              </CFormSelect>
              <CInputGroupText>Status</CInputGroupText>
              <CFormSelect v-model="filter.status">
                <option value="2">All</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </CFormSelect>
              <CButton v-c-tooltip="{ content: 'Filter data', placement: 'top' }" type="button" color="secondary" variant="outline" @click="getData">
                <CIcon icon="cil-filter" width="24" height="24" />
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>
        <CRow>
          <CCol md="12" class="mb-3">
            <CInputGroup>
              <CFormInput v-model="keyword" placeholder="Search..." />
              <CButton v-c-tooltip="{ content: 'Search data', placement: 'top' }" type="button" color="secondary" variant="outline">
                <CIcon icon="cil-search" width="24" height="24" />
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>
        <table class="table table-hover table-bordered table-striped table-sm">
          <thead class="align-middle text-center">
            <tr class="table-secondary">
              <th>#</th>
              <th>Kode</th>
              <th>Target</th>
              <th>Departemen</th>
              <th>Status</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mApproval && mApproval.data && mApproval.data.length > 0">
            <tr v-for="(apv, idx) in filteredData">
              <td>{{ idx + 1 }}</td>
              <td>{{ apv.apvh_code }}</td>
              <td>{{ formatTarget(apv.apvh_target) }}</td>
              <td>{{ apv.departements?.dep_name }}</td>
              <td>{{ formatStatus(apv.apvh_status) }}</td>
              <td>{{ apv.users.name }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success" @click="getDetail(apv.id)">
                    <CIcon icon="cil-description" width="20" height="20" />
                  </CButton>
                  <CButton v-if="apv.apvh_status == 1" v-c-tooltip="{ content: 'Cancel', placement: 'top' }" color="danger" @click="getStatus(apv.id, 0)">
                    <CIcon icon="cil-x-circle" width="20" height="20" />
                  </CButton>
                  <CButton v-else v-c-tooltip="{ content: 'Cancel', placement: 'top' }" color="primary" @click="getStatus(apv.id, 1)">
                    <CIcon icon="cil-x-circle" width="20" height="20" />
                  </CButton>
                </CButtonGroup>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="text-center">Tidak ada data.</td>
            </tr>
          </tbody>
        </table>
        <nav v-if="mApproval && mApproval.data && mApproval.data.length > 0" class="mt-2">
          <CButtonGroup role="group">
            <CButton type="button" color="secondary" variant="outline" :disabled="mApproval.current_page === 1" @click="getData(mApproval.current_page - 1)">&#60;</CButton>
            <template v-for="page in calculatePages()">
              <CButton type="button" color="secondary" variant="outline" @click="getData(page)" :class="{ active: page === mApproval.current_page }">{{ page }}</CButton>
            </template>
            <CButton type="button" color="secondary" variant="outline" :disabled="mApproval.current_page === mApproval.last_page" @click="getData(mApproval.current_page + 1)">&#62;</CButton>
          </CButtonGroup>
        </nav>
      </CCardBody>
    </CCard>
  </Pages>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.apv"
    @close="
      () => {
        modal.apv = false;
        setDefault();
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Approval</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CAlert
        class="d-flex align-items-center"
        :color="alert.color"
        :visible="alert.visibleOnModal"
        dismissible
        @close="
          () => {
            alert.visibleOnModal = false;
          }
        "
      >
        <CIcon v-if="alert.color == 'warning'" icon="cil-warning" class="flex-shrink-0 me-2" width="24" height="24" />
        <CIcon v-if="alert.color == 'success'" icon="cil-check-circle" class="flex-shrink-0 me-2" width="24" height="24" />
        <CIcon v-if="alert.color == 'danger'" icon="cil-x-circle" class="flex-shrink-0 me-2" width="24" height="24" />
        <div>
          <strong>{{ alert.title }}</strong> {{ alert.message }}
        </div>
      </CAlert>
      <CRow>
        <CCol md="2" class="mb-3">
          <CFormInput v-model="countInput" type="number" label="Jumlah User" placeholder="Jumlah User" />
        </CCol>
        <CCol md="5" class="mb-3">
          <CFormSelect v-model="approval.target" @change="approval.department = null" label="Target">
            <option value="1">Nota Terima Barang</option>
            <option value="2">Payment Voucher</option>
          </CFormSelect>
        </CCol>
        <CCol md="5" class="mb-3">
          <CFormSelect :disabled="approval.target == 2" v-model="approval.department" label="Departemen">
            <option value="">Pilih departemen</option>
            <option v-for="department in departments" :value="department.dep_code">
              {{ department.dep_name }}
            </option>
          </CFormSelect>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormInput type="text" v-model="approval.description" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in formItems" :key="index">
        <CCol md="2" class="mb-3">
          <CFormInput disabled v-model="item.level" type="text" label="Level" placeholder="Level" />
        </CCol>
        <CCol md="6" class="mb-3">
          <label class="mb-2">User</label>
          <v-select v-model="item.user" :options="users.data" :filterable="true" label="name" @search="searchUsers" :loading="users.isLoading"></v-select>
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput v-model="item.description" type="text" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Simpan', placement: 'top' }" @click="validApv" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    fullscreen
    alignment="center"
    backdrop="static"
    :visible="modal.detail"
    @close="
      () => {
        modal.detail = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Detail Data</CModalTitle>
    </CModalHeader>
    <CModalBody v-if="apvDetail">
      <CRow>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="apvDetail.apvh_code" label="Kode Approval" placeholder="Kode Approval" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatStatus(apvDetail.apvh_status)" label="Status" placeholder="Status" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="formatTarget(apvDetail.apvh_target)" label="Target" placeholder="Target" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled type="text" :value="apvDetail.apvh_description" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <CFormInput disabled type="text" :value="apvDetail.departements?.dep_name" label="Departemen" placeholder="Departemen" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled type="text" :value="apvDetail.users.name" label="User" placeholder="User" />
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in apvDetail.approval_users">
        <CCol md="1" class="mb-3">
          <CFormInput disabled :value="item.apvu_level" type="text" label="Level" placeholder="Level" />
        </CCol>
        <CCol md="5" class="mb-3">
          <CFormInput disabled :value="item.users.name" type="text" label="Nama User" placeholder="Nama User" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="item.apvu_description" type="text" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
      </CRow>
    </CModalBody>
  </CModal>
  <CModal
    :visible="modal.confirm"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        (modal.confirm = false), (modal.apv = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Apakah anda yakin akan menambahkan data approval</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveApv()" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    :visible="modal.status"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        modal.status = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>{{ modal.statusMessage }}</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="setStatusApv" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<style>
.table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
}

.table th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#mySecondary {
  background-color: rgb(226, 227, 229);
  color: rgb(0, 0, 0);
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 9999px inset;
}
</style>

<script>
import Pages from "@/components/template/Pages.vue";
import ApiService from "@/services/api/api.js";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  components: {
    Pages,
    vSelect,
  },
  data() {
    return {
      title: "A/P GENERAL",
      modal: {
        apvId: null,
        apv: false,
        detail: false,
        statusMessage: null,
        status: false,
        confirm: false,
      },
      user: JSON.parse(localStorage.getItem("user")),
      abortController: null,
      users: {
        data: [],
        isLoading: false,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      approval: {
        setStatus: 1,
        selectedId: null,
        target: "1",
        department: null,
        description: null,
      },
      departments: [],
      filter: {
        perPage: "50",
        status: "2",
      },
      mApproval: [],
      apvDetail: [],
      keyword: "",
      countInput: 1,
      formItems: [{ level: 1, user: [], description: null }],
    };
  },
  watch: {
    countInput(newVal) {
      const count = parseInt(newVal, 10);
      if (count > 0) {
        this.adjustFormItems(count);
      }
    },
  },
  computed: {
    filteredData() {
      if (this.keyword.trim() === "") {
        return this.mApproval.data;
      }

      const filtered = this.mApproval.data.filter((item) => {
        if (item && item.do_number) {
          return item.do_number.toLowerCase().includes(this.keyword.toLowerCase());
        }
        return false;
      });

      if (filtered.length === 0) {
        this.getAlert("warning", "Not Found!", "Data tidak ditemukan pada halaman ini atau keyword salah.", "main");
      }

      return filtered;
    },
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        0: "Inactive",
        1: "Active",
      };
      return statusMap[status] || "Unknown";
    },
    formatTarget(status) {
      const statusMap = {
        1: "Nota Terima Barang",
        2: "Payment Voucher",
      };
      return statusMap[status] || "Unknown";
    },
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getApproval(this.filter, page);
        this.mApproval = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mApproval.total} data.`, "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async openNewApv() {
      try {
        this.$root.loader = true;
        const response = await ApiService.getDep();
        this.departments = response.data;
        this.modal.apv = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async getDetail(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getapvDetail(id);
        this.apvDetail = response.data;
        this.modal.detail = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async searchUsers(keyword) {
      try {
        this.users.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.users.isLoading = true;
        const response = await ApiService.searchUsers(keyword, signal);
        this.users.data = response.data.map((user) => ({
          id: user.id,
          name: user.name,
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.users.isLoading = false;
      }
    },
    async setStatusApv() {
      try {
        this.$root.loader = true;
        const response = await ApiService.setStatusApv(this.approval.selectedId, this.approval.setStatus);
        this.getData();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menonaktifkan approval.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.status = false;
      }
    },
    getStatus(id, status) {
      this.approval.selectedId = id;
      this.approval.setStatus = status;
      if (status === 1) {
        this.modal.statusMessage = "Apakah anda yakin akan mengaktifkan approval?";
      } else if (status === 0) {
        this.modal.statusMessage = "Apakah anda yakin akan menonaktifkan approval?";
      }
      this.modal.status = true;
    },
    async saveApv() {
      try {
        this.$root.loader = true;
        const data = {
          apvh_description: this.approval.description,
          dep_code: this.approval.department,
          apvh_target: this.approval.target,
          apvh_status: 1,
          apvh_users: btoa(JSON.stringify(this.formItems)),
          user_id: this.user.id,
        };
        if (this.modal.action == 1) {
          const response = await ApiService.saveApv(data);
        } else if (this.modal.action == 2) {
          const response = await ApiService.editApv(data, this.modal.apvId);
        }
        this.setDefault();
        this.getData();
        this.getAlert("success", "Success", "Berhasil menyimpan approval.", "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan approval.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirm = false;
      }
    },
    adjustFormItems(count) {
      const currentCount = this.formItems.length;
      if (count > currentCount) {
        for (let i = currentCount; i < count; i++) {
          this.formItems.push({ level: i + 1, user: [], description: null });
        }
      } else if (count < currentCount) {
        this.formItems.splice(count);
      }
    },
    validApv() {
      this.alert.visibleOnModal = false;
      if (!this.approval.department && this.approval.target == 1) {
        this.getAlert("danger", "Error", "Departemen harus dipilih.", "modal");
      } else if (!this.approval.target) {
        this.getAlert("danger", "Error", "Target harus dipilih.", "modal");
      } else if (!this.approval.description) {
        this.getAlert("danger", "Error", "Deskripsi harus diisi.", "modal");
      } else if (this.formItems.some((item) => !item.user || !item.description)) {
        this.getAlert("danger", "Error", "Data user harus diisi.", "modal");
      } else {
        this.modal.confirm = true;
        this.modal.apv = false;
      }
    },
    setDefault() {
      this.approval = {
        target: "1",
        description: null,
      };
      this.countInput = 1;
      this.formItems = [{ level: 1, user: [], description: null }];
    },
    getAlert(color, title, message, target) {
      this.alert.title = title;
      this.alert.color = color;
      this.alert.message = message;
      if (target == "modal") {
        this.alert.visibleOnModal = true;
      } else if (target == "main") {
        this.alert.visibleOnMain = true;
      }
    },
    calculatePages() {
      const startPage = Math.max(1, this.mApproval.current_page - 4);
      const endPage = Math.min(startPage + 8, this.mApproval.last_page);

      return Array.from(
        {
          length: endPage - startPage + 1,
        },
        (_, i) => startPage + i
      );
    },
  },
};
</script>
