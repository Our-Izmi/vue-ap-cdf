<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader class="d-flex justify-content-between align-items-center">
        <strong>Surat Jalan</strong>
        <CButton
          v-c-tooltip="{ content: 'Tambah Surat Jalan', placement: 'top' }"
          @click="
            () => {
              modal.sj = true;
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
                <option value="5">All</option>
                <option value="1">Draft</option>
                <option value="2">Complete</option>
                <option value="3">Canceled</option>
                <option value="4">Closed</option>
              </CFormSelect>
              <CInputGroupText>Date Start</CInputGroupText>
              <CFormInput v-model="filter.dateStart" type="date" />
              <CInputGroupText>Date End</CInputGroupText>
              <CFormInput v-model="filter.dateEnd" type="date" />
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
              <th>Nomer</th>
              <th>Tanggal</th>
              <th>PO</th>
              <th>Vendor</th>
              <th>Nilai</th>
              <th>Status</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mDelivery && mDelivery.data && mDelivery.data.length > 0">
            <tr v-for="(sj, idx) in filteredData">
              <td>{{ idx + 1 }}</td>
              <td>{{ sj.do_number }}</td>
              <td class="text-center">{{ formatDate(sj.do_date) }}</td>
              <td>{{ sj.po_number }}</td>
              <td>{{ `${sj.vendors.vend_code} | ${sj.vendors.vend_name}` }}</td>
              <td>{{ formatAmount(sj.do_amount) }}</td>
              <td>{{ formatStatus(sj.do_status) }}</td>
              <td>{{ sj.users.name }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success" @click="getDetail(sj.id)">
                    <CIcon icon="cil-description" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="sj.do_status != 1" v-c-tooltip="{ content: 'Edit', placement: 'top' }" color="primary" @click="getEdit(sj.id)">
                    <CIcon icon="cil-pen" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="sj.do_status != 2 && sj.do_status != 1" v-c-tooltip="{ content: 'Cancel', placement: 'top' }" color="danger" @click="getCancelDO(sj.id)">
                    <CIcon icon="cil-x-circle" width="20" height="20" />
                  </CButton>
                </CButtonGroup>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="text-center">Tidak ada data.</td>
            </tr>
          </tbody>
        </table>
        <nav v-if="mDelivery && mDelivery.data && mDelivery.data.length > 0" class="mt-2">
          <CButtonGroup role="group">
            <CButton type="button" color="secondary" variant="outline" :disabled="mDelivery.current_page === 1" @click="getData(mDelivery.current_page - 1)">&#60;</CButton>
            <template v-for="page in calculatePages()">
              <CButton type="button" color="secondary" variant="outline" @click="getData(page)" :class="{ active: page === mDelivery.current_page }">{{ page }}</CButton>
            </template>
            <CButton type="button" color="secondary" variant="outline" :disabled="mDelivery.current_page === mDelivery.last_page" @click="getData(mDelivery.current_page + 1)">&#62;</CButton>
          </CButtonGroup>
        </nav>
      </CCardBody>
    </CCard>
  </Pages>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.sj"
    @close="
      () => {
        modal.sj = false;
        setDefault();
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Surat Jalan</CModalTitle>
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
        <CCol md="6" class="mb-3">
          <label class="mb-2">Vendor</label>
          <v-select v-model="vendors.selectedVendor" :options="vendors.data" :filterable="true" label="id_vendname" @search="searchVendors" :loading="vendors.isLoading"></v-select>
        </CCol>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Purchase Order</label>
          <v-select v-model="po.selectedPO" :options="po.data" :filterable="true" label="po_no" @search="searchPO" :loading="po.isLoading"></v-select>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormInput v-model="delivery.number" type="text" label="Nomer Surat Jalan" placeholder="Nomer Surat Jalan" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormInput v-model="delivery.date" type="date" label="Tanggal Surat Jalan" placeholder="Tanggal Surat Jalan" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea v-model="delivery.note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Tambah Barang', placement: 'top' }"
        @click="
          () => {
            modal.barang = true;
            modal.sj = false;
          }
        "
        color="secondary"
      >
        <CIcon icon="cil-inbox" width="24" height="24" />
      </CButton>
      <CButton v-c-tooltip="{ content: 'Simpan', placement: 'top' }" @click="validSJ" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    fullscreen
    alignment="center"
    backdrop="static"
    :visible="modal.barang"
    @close="
      () => {
        modal.barang = false;
        modal.sj = true;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Barang</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput v-model="countInput" type="number" label="Jumlah Tipe Unit" placeholder="Jumlah Tipe Unit" />
        </CCol>
        <CCol md="8" class="mb-3">
          <CFormInput disabled type="number" v-model="delivery.amount" label="Total Nilai Barang" placeholder="Total Nilai Barang" />
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in formItems" :key="index">
        <CCol md="1" class="mb-3">
          <CFormInput v-model="item.no" type="text" label="No" placeholder="No" />
        </CCol>
        <CCol md="5" class="mb-3">
          <CFormInput v-model="item.description" type="text" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput v-model="item.qty" type="number" label="Qty" placeholder="Qty" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput v-model="item.amount" type="number" label="Harga" placeholder="Harga" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled v-model="item.subTotal" type="number" label="Sub Total" placeholder="Sub Total" />
        </CCol>
      </CRow>
    </CModalBody>
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
    <CModalBody v-if="doDetail">
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="doDetail.do_number" label="Nomer Surat Jalan" placeholder="Nomer Surat Jalan" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(doDetail.do_date)" label="Tanggal Surat Jalan" placeholder="Tanggal Surat Jalan" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(doDetail.do_amount)" label="Nilai Surat Jalan" placeholder="Nilai Surat Jalan" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="doDetail.po_number" label="Nomer Purchase Order" placeholder="Nomer Purchase Order" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="`${doDetail.vendors.vend_code} | ${doDetail.vendors.vend_name}`" label="Nama Vendor" placeholder="Nama Vendor" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="doDetail.users.name" label="Nama User" placeholder="Nama User" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea disabled type="text" :value="doDetail.do_note" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in doDetail.do_description">
        <CCol md="1" class="mb-3">
          <CFormInput disabled :value="item.no" type="text" label="No" placeholder="No" />
        </CCol>
        <CCol md="5" class="mb-3">
          <CFormInput disabled :value="item.description" type="text" label="Deskripsi" placeholder="Deskripsi" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled :value="item.qty" type="text" label="Qty" placeholder="Qty" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled :value="formatAmount(item.amount)" type="text" label="Harga" placeholder="Harga" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled :value="formatAmount(item.subTotal)" type="text" label="Sub Total" placeholder="Sub Total" />
        </CCol>
      </CRow>
    </CModalBody>
  </CModal>
  <CModal
    :visible="modal.confirmFirst"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        (modal.confirmFirst = false), (modal.sj = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Simpan surat jalan?</CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (modal.confirmSecond = true), (delivery.status = 2), (modal.secondMessage = 'Apakah anda yakin akan menyelesaikan surat jalan?');
          }
        "
      >
        <CIcon icon="cil-arrow-thick-to-top" width="24" height="24" />
      </CButton>
      <CButton v-c-tooltip="{ content: 'Draft', placement: 'top' }" @click="saveAsDraft" color="secondary">
        <CIcon icon="cil-paperclip" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    :visible="modal.confirmSecond"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        (modal.confirmSecond = false), (modal.confirmFirst = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>{{ modal.secondMessage }}</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveDO()" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    :visible="modal.cancel"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        modal.cancel = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Apakah anda yakin akan membatalkan surat jalan?</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="cancelDO" color="success">
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
import { format } from "date-fns";
import numeral from "numeral";

export default {
  components: {
    Pages,
    vSelect,
  },
  data() {
    return {
      title: "A/P GENERAL",
      modal: {
        sjId: null,
        sj: false,
        barang: false,
        detail: false,
        cancel: false,
        confirmFirst: false,
        confirmSecond: false,
        secondMessage: "",
      },
      user: JSON.parse(localStorage.getItem("user")),
      roleUser: null,
      abortController: null,
      vendors: {
        data: [],
        selectedVendor: null,
        isLoading: false,
      },
      po: {
        data: [],
        selectedPO: null,
        isLoading: false,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      delivery: {
        selectedId: null,
        number: null,
        date: null,
        note: null,
        amount: 0,
        status: 2,
      },
      filter: {
        perPage: "50",
        status: "5",
        dateStart: null,
        dateEnd: null,
      },
      mDelivery: [],
      doDetail: [],
      keyword: "",
      countInput: 1,
      formItems: [{ no: 1, description: null, qty: 0, amount: 0, subTotal: 0 }],
    };
  },
  async mounted() {
    await this.getRoleUser();
  },
  watch: {
    countInput(newVal) {
      const count = parseInt(newVal, 10);
      if (count > 0) {
        this.adjustFormItems(count);
      }
    },
    formItems: {
      handler(newVal) {
        this.updateSubTotals();
        this.updateTotalAmount();
      },
      deep: true,
    },
  },
  computed: {
    filteredData() {
      if (this.keyword.trim() === "") {
        return this.mDelivery.data;
      }

      const filtered = this.mDelivery.data.filter((item) => {
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
    formatAmount(number) {
      return numeral(number).format("0,0.00");
    },
    formatDate(data) {
      return format(new Date(data), "dd-MM-yyyy");
    },
    formatDateOther(data) {
      return format(new Date(data), "yyyy-MM-dd");
    },
    formatStatus(status) {
      const statusMap = {
        1: "Draft",
        2: "Complete",
        3: "Canceled",
        4: "Closed",
      };
      return statusMap[status] || "Unknown";
    },
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getDO(this.filter, this.roleUser.dep_code, page);
        this.mDelivery = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mDelivery.total} data.`, "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async getRoleUser() {
      try {
        this.$root.loader = true;
        const response = await ApiService.getRoleUser(this.user.id);
        this.roleUser = response.data;
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
        const response = await ApiService.getDODetail(id);
        this.doDetail = response.data;
        this.doDetail.do_description = JSON.parse(atob(this.doDetail.do_description));
        this.modal.detail = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async getEdit(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getDODetail(id);
        this.doDetail = response.data;
        this.doDetail.do_description = JSON.parse(atob(this.doDetail.do_description));
        this.delivery = {
          number: this.doDetail.do_number,
          date: this.formatDateOther(this.doDetail.do_date),
          note: this.doDetail.do_note,
          amount: this.doDetail.do_amount,
        };
        this.vendors.selectedVendor = {
          id_vendname: this.doDetail.vendors.vend_code + " | " + this.doDetail.vendors.vend_name,
          id: this.doDetail.vendors.vend_code,
        };
        this.po.selectedPO = {
          po_no: this.doDetail.po_number,
          tgl_buat: this.doDetail.po_date,
        };
        this.countInput = this.doDetail.do_description.length;
        this.formItems = this.doDetail.do_description;
        this.modal.action = 2;
        this.modal.sjId = id;
        this.modal.sj = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async searchVendors(keyword) {
      try {
        this.vendors.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.vendors.isLoading = true;
        const response = await ApiService.searchVendors(keyword, signal);
        this.vendors.data = response.data.map((vendor) => ({
          id: vendor.id,
          id_vendname: vendor.id_vendname,
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.vendors.isLoading = false;
      }
    },
    async searchPO(keyword) {
      try {
        this.po.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.po.isLoading = true;
        const response = await ApiService.searchPO(keyword, signal);
        this.po.data = response.data.map((po) => ({
          po_no: po.po_no,
          tgl_buat: po.tgl_buat,
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.po.isLoading = false;
      }
    },
    async cancelDO() {
      try {
        this.$root.loader = true;
        const response = await ApiService.cancelDO(this.delivery.selectedId);
        this.getData();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat membatalkan surat jalan.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.cancel = false;
      }
    },
    getCancelDO(id) {
      this.delivery.selectedId = id;
      this.modal.cancel = true;
    },
    async saveDO() {
      try {
        this.$root.loader = true;
        const data = {
          dep_code: this.roleUser.dep_code,
          do_number: this.delivery.number,
          do_date: this.delivery.date,
          po_number: this.po.selectedPO.po_no,
          po_date: this.po.selectedPO.tgl_buat,
          vend_code: this.vendors.selectedVendor.id,
          do_note: this.delivery.note,
          do_description: btoa(JSON.stringify(this.formItems)),
          do_amount: this.delivery.amount,
          do_status: this.delivery.status,
          user_id: this.user.id,
        };
        if (this.modal.action == 1) {
          const response = await ApiService.saveDO(data);
        } else if (this.modal.action == 2) {
          const response = await ApiService.editDO(data, this.modal.sjId);
        }
        this.setDefault();
        this.getData();
        this.getAlert("success", "Success", "Berhasil menyimpan surat jalan.", "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan surat jalan.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirmFirst = false;
        this.modal.confirmSecond = false;
      }
    },
    adjustFormItems(count) {
      const currentCount = this.formItems.length;
      if (count > currentCount) {
        for (let i = currentCount; i < count; i++) {
          this.formItems.push({ no: i + 1, description: null, qty: 0, amount: 0, subTotal: 0 });
        }
      } else if (count < currentCount) {
        this.formItems.splice(count);
      }
    },
    updateSubTotals() {
      this.formItems.forEach((item) => {
        item.subTotal = item.qty * item.amount;
      });
    },
    updateTotalAmount() {
      this.delivery.amount = this.formItems.reduce((total, item) => {
        return total + item.subTotal;
      }, 0);
    },
    validSJ() {
      this.alert.visibleOnModal = false;
      if (!this.vendors.selectedVendor) {
        this.getAlert("danger", "Error", "Vendor harus dipilih.", "modal");
      } else if (!this.po.selectedPO) {
        this.getAlert("danger", "Error", "Purchase order harus dipilih.", "modal");
      } else if (!this.delivery.number) {
        this.getAlert("danger", "Error", "Nomor surat jalan harus diisi.", "modal");
      } else if (!this.delivery.date) {
        this.getAlert("danger", "Error", "Tanggal surat jalan harus diisi.", "modal");
      } else if (this.formItems.some((item) => !item.description)) {
        this.getAlert("danger", "Error", "Deskripsi barang harus diisi.", "modal");
      } else {
        this.modal.confirmFirst = true;
        this.modal.sj = false;
      }
    },
    saveAsDraft() {
      this.delivery.status = 1;
      this.saveDO();
    },
    setDefault() {
      this.delivery = {
        number: null,
        date: null,
        note: null,
        amount: 0,
        status: 2,
      };
      this.vendors = {
        data: [],
        selectedVendor: null,
        isLoading: false,
      };
      this.po = {
        data: [],
        selectedPO: null,
        isLoading: false,
      };
      this.countInput = 1;
      this.formItems = [{ no: 1, description: null, qty: 0, amount: 0, subTotal: 0 }];
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
      const startPage = Math.max(1, this.mDelivery.current_page - 4);
      const endPage = Math.min(startPage + 8, this.mDelivery.last_page);

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
