<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader class="d-flex justify-content-between align-items-center">
        <strong>Nota Terima Barang</strong>
        <CButton v-c-tooltip="{ content: 'Tambah Nota Terima Barang', placement: 'top' }" @click="openModalNewNTB" color="success">
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
                <option value="7">All</option>
                <option value="1">Draft</option>
                <option value="2">Complete</option>
                <option value="3">Canceled</option>
                <option value="4">Approved</option>
                <option value="5">Rejected</option>
                <option value="6">Closed</option>
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
              <th>No. Surat Jalan</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mReceipt && mReceipt.data && mReceipt.data.length > 0">
            <tr v-for="(rn, idx) in filteredData">
              <td>{{ idx + 1 }}</td>
              <td>{{ rn.rn_number }}</td>
              <td class="text-center">{{ formatDate(rn.rn_date) }}</td>
              <td>{{ rn.delivery_orders.do_number }}</td>
              <td>{{ `${rn.delivery_orders.vendors.vend_code} | ${rn.delivery_orders.vendors.vend_name}` }}</td>
              <td>{{ formatStatus(rn.rn_status) }}</td>
              <td>{{ rn.users.name }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton v-c-tooltip="{ content: 'Export Docx', placement: 'top' }" color="secondary" @click="getDocx(rn.id)">
                    <CIcon icon="cil-arrow-thick-from-top" width="20" height="20" />
                  </CButton>
                  <CButton v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success" @click="getDetail(rn.id)">
                    <CIcon icon="cil-description" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="rn.rn_status != 1" v-c-tooltip="{ content: 'Edit', placement: 'top' }" color="primary" @click="getEdit(rn.id)">
                    <CIcon icon="cil-pen" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="rn.rn_status != 1" v-c-tooltip="{ content: 'Cancel', placement: 'top' }" color="danger" @click="openModalCancel(rn.id)">
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
        <nav v-if="mReceipt && mReceipt.data && mReceipt.data.length > 0" class="mt-2">
          <CButtonGroup role="group">
            <CButton type="button" color="secondary" variant="outline" :disabled="mReceipt.current_page === 1" @click="getData(mReceipt.current_page - 1)">&#60;</CButton>
            <template v-for="page in calculatePages()">
              <CButton type="button" color="secondary" variant="outline" @click="getData(page)" :class="{ active: page === mReceipt.current_page }">{{ page }}</CButton>
            </template>
            <CButton type="button" color="secondary" variant="outline" :disabled="mReceipt.current_page === mReceipt.last_page" @click="getData(mReceipt.current_page + 1)">&#62;</CButton>
          </CButtonGroup>
        </nav>
      </CCardBody>
    </CCard>
  </Pages>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.ntb"
    @close="
      () => {
        modal.ntb = false;
        setDefault();
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form {{ modal.action == 1 ? "Input" : "Edit" }} Nota Terima Barang</CModalTitle>
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
          <v-select v-model="vendors.selectedVendor" :options="vendors.data" @option:selected="changeVendor()" :filterable="true" label="id_vendname" @search="searchVendors" :loading="vendors.isLoading"></v-select>
        </CCol>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Nomer Surat Jalan</label>
          <v-select :disabled="!vendors.selectedVendor" v-model="delivery.selectedDelivery" @option:selected="setData()" :options="delivery.data" :filterable="true" label="do_number" @search="searchDO" :loading="delivery.isLoading"></v-select>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Jenis Nota Terima Barang</label>
          <v-select v-model="ntb.type.selectedType" :options="ntb.type.data" :filterable="true" label="rnt_name"></v-select>
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput v-model="ntb.date" type="date" label="Tanggal Terima Barang" placeholder="Tanggal Terima Barang" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea v-model="ntb.note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton
        :disabled="delivery.selectedDelivery && !delivery.selectedDelivery.do_number"
        v-c-tooltip="{ content: 'Tambah Barang', placement: 'top' }"
        @click="
          () => {
            modal.barang = true;
            modal.ntb = false;
          }
        "
        color="secondary"
      >
        <CIcon icon="cil-inbox" width="24" height="24" />
      </CButton>
      <CButton v-c-tooltip="{ content: 'Simpan', placement: 'top' }" @click="validNTB" color="success">
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
        modal.ntb = true;
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
          <CFormInput v-model="item.note" type="text" label="Keterangan" placeholder="Keterangan" />
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
        (modal.confirmFirst = false), (modal.ntb = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Simpan nota terima barang?</CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (modal.confirmSecond = true), (ntb.status = 2), (modal.secondMessage = 'Apakah anda yakin akan menyelesaikan nota terima barang?');
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
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveNTB()" color="success">
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
    <CModalBody v-if="rnDetail">
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="rnDetail.rn_number" label="Nomer Nota Terima Barang" placeholder="Nomer Nota Terima Barang" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(rnDetail.rn_date)" label="Tanggal Nota Terima Barang" placeholder="Tanggal Nota Terima Barang" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(rnDetail.rn_receipt_date)" label="Tanggal Terima Barang" placeholder="Tanggal Nota Terima Barang" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="rnDetail.receipt_note_types.rnt_name" label="Jenis" placeholder="Jenis" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="rnDetail.do_number" label="Nomer Surat Jalan" placeholder="Nomer Surat Jalan" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="`${rnDetail.delivery_orders.vendors.vend_code} | ${rnDetail.delivery_orders.vendors.vend_name}`" label="Nama Vendor" placeholder="Nama Vendor" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="rnDetail.users.name" label="Nama User" placeholder="Nama User" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea disabled :value="rnDetail.rn_note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in rnDetail.rn_description">
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
          <CFormInput disabled :value="item.note" type="text" label="Note" placeholder="Note" />
        </CCol>
      </CRow>
      <CRow v-for="(apv, index) in rnDetail.approval_data_headers.approvals">
        <CCol md="4" class="mb-3">
          <CFormInput disabled :value="apv.users.name" type="text" :label="`Nama ${index + 1}`" :placeholder="`Nama ${index + 1}`" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled :value="formatStatusUser(apv.apv_status)" type="text" :label="`Status ${index + 1}`" :placeholder="`Status ${index + 1}`" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="apv.apv_note" type="text" :label="`Note ${index + 1}`" :placeholder="`Note ${index + 1}`" />
        </CCol>
      </CRow>
    </CModalBody>
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
    <CModalBody>Apakah anda yakin akan membatalkan nota terima barang?</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveNTB()" color="success">
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
      user: JSON.parse(localStorage.getItem("user")),
      roleUser: null,
      modal: {
        action: 1,
        ntbId: null,
        ntb: false,
        barang: false,
        detail: false,
        cancel: false,
        confirmFirst: false,
        confirmSecond: false,
        secondMessage: "",
      },
      abortController: null,
      vendors: {
        data: [],
        selectedVendor: null,
        isLoading: false,
      },
      ntb: {
        date: this.getCurrentDate(),
        status: 2,
        type: {
          selectedType: null,
          data: [],
        },
        note: null,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      delivery: {
        data: [],
        selectedDelivery: [],
        isLoading: false,
      },
      filter: {
        perPage: "50",
        status: "7",
        dateStart: null,
        dateEnd: null,
      },
      mReceipt: [],
      rnDetail: [],
      keyword: "",
      countInput: 1,
      formItems: [{ no: 1, description: null, qty: 0, amount: 0, note: null }],
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
        this.updateTotalAmount();
      },
      deep: true,
    },
  },
  computed: {
    filteredData() {
      if (this.keyword.trim() === "") {
        return this.mReceipt.data;
      }

      const filtered = this.mReceipt.data.filter((item) => {
        if (item && item.rn_number) {
          return item.rn_number.toLowerCase().includes(this.keyword.toLowerCase());
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
    async getDocx(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getRNDocx(id);
        const base64Data = response.data;

        const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${Math.random().toString(36).substring(2, 15)}.docx`;
        link.rel = "noopener";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
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
        const response = await ApiService.getRNDetail(id);
        this.rnDetail = response.data;
        this.rnDetail.rn_description = JSON.parse(atob(this.rnDetail.rn_description));
        this.modal.detail = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    getCurrentDate() {
      return format(new Date(), "yyyy-MM-dd");
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
        4: "Approved",
        5: "Rejected",
        6: "Closed",
      };
      return statusMap[status] || "Unknown";
    },
    formatStatusUser(status) {
      const statusMap = {
        1: "Process",
        2: "Approved",
        3: "Rejected",
      };
      return statusMap[status] || "Unknown";
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
        const response = await ApiService.searchVendorsGeneral(keyword, signal);
        this.vendors.data = response.data.map((vendor) => ({
          vend_code: vendor.vend_code,
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
    async searchDO(keyword) {
      try {
        this.delivery.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.delivery.isLoading = true;
        const response = await ApiService.searchDO(this.vendors.selectedVendor.vend_code, this.roleUser.dep_code, keyword, signal);
        this.delivery.data = response.data.map((del) => ({
          do_number: del.do_number,
          do_id: del.id,
          do_description: JSON.parse(atob(del.do_description)),
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.delivery.isLoading = false;
      }
    },
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getNTB(this.filter, this.roleUser.dep_code, page);
        this.mReceipt = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mReceipt.total} data.`, "main");
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
    async openModalNewNTB() {
      try {
        this.$root.loader = true;
        const responseType = await ApiService.getType();
        this.ntb.type.data = responseType.data.map((type) => ({
          id: type.id,
          rnt_name: type.rnt_name,
        }));
        this.modal.ntb = true;
        this.modal.action = 1;
      } catch (error) {
        this.getAlert("danger", "Error", "Terjadi error saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async saveNTB() {
      try {
        this.$root.loader = true;
        if (this.modal.action == 3) {
          const response = await ApiService.cancelNTB(this.modal.ntbId);
        } else {
          const data = {
            dep_code: this.roleUser.dep_code,
            do_number: this.delivery.selectedDelivery.do_number,
            do_id: this.delivery.selectedDelivery.do_id,
            rn_receipt_date: this.ntb.date,
            rnt_id: this.ntb.type.selectedType.id,
            rn_note: this.ntb.note,
            rn_description: btoa(JSON.stringify(this.formItems)),
            rn_status: this.ntb.status,
            user_id: this.user.id,
          };
          if (this.modal.action == 1) {
            const response = await ApiService.saveNTB(data);
          } else if (this.modal.action == 2) {
            const response = await ApiService.editNTB(data, this.modal.ntbId);
          }
        }
        this.setDefault();
        this.getData();
        this.getAlert("success", "Success", "Berhasil menyimpan nota terima barang.", "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan nota terima barang.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirmFirst = false;
        this.modal.confirmSecond = false;
        this.modal.cancel = false;
      }
    },
    async getEdit(id) {
      try {
        this.$root.loader = true;

        const [response, responseType] = await Promise.all([ApiService.getRNDetail(id), ApiService.getType()]);

        let { rnDetail } = this;
        const { rn_receipt_date, receipt_note_types, delivery_orders } = response.data;

        rnDetail = response.data;
        rnDetail.rn_description = JSON.parse(atob(rnDetail.rn_description));

        const formattedDate = this.formatDateOther(rn_receipt_date);

        const typeData = responseType.data.map((type) => ({
          id: type.id,
          rnt_name: type.rnt_name,
        }));

        this.ntb = {
          date: formattedDate,
          type: {
            data: typeData,
            selectedType: {
              id: receipt_note_types.id,
              rnt_name: receipt_note_types.rnt_name,
            },
          },
        };

        this.delivery.selectedDelivery = {
          do_number: delivery_orders.do_number,
          do_id: delivery_orders.id,
          do_description: JSON.parse(atob(delivery_orders.do_description)),
        };

        this.vendors.selectedVendor = {
          id_vendname: `${delivery_orders.vendors.vend_code} | ${delivery_orders.vendors.vend_name}`,
          id: delivery_orders.vendors.vend_code,
        };

        this.countInput = rnDetail.rn_description.length;
        this.formItems = rnDetail.rn_description;

        this.modal.action = 2;
        this.modal.ntbId = id;
        this.modal.ntb = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    validNTB() {
      this.alert.visibleOnModal = false;
      if (!this.vendors.selectedVendor) {
        this.getAlert("danger", "Error", "Vendor harus dipilih.", "modal");
      } else if (this.delivery.selectedDelivery.length === 0) {
        this.getAlert("danger", "Error", "Nomer surat jalan harus dipilih.", "modal");
      } else if (!this.ntb.type.selectedType) {
        this.getAlert("danger", "Error", "Jenis nota terima barang harus dipilih.", "modal");
      } else if (!this.ntb.date) {
        this.getAlert("danger", "Error", "Tanggal nota terima barang harus diisi.", "modal");
      } else if (this.formItems.some((item) => !item.description || !item.note)) {
        this.getAlert("danger", "Error", "Semua deskripsi dan catatan item harus diisi.", "modal");
      } else {
        this.modal.confirmFirst = true;
        this.modal.ntb = false;
      }
    },
    setData() {
      try {
        if (Array.isArray(this.delivery.selectedDelivery.do_description)) {
          this.formItems = this.delivery.selectedDelivery.do_description.map((item) => ({
            no: item.no || 0,
            description: item.description || null,
            qty: item.qty || 0,
            amount: item.amount || 0,
            subTotal: item.subTotal || 0,
            note: null,
          }));
        }
      } catch (error) {
        this.getAlert("danger", "Error", "Terjadi error.", "modal");
      }
    },
    adjustFormItems(count) {
      const currentCount = this.formItems.length;
      if (count > currentCount) {
        for (let i = currentCount; i < count; i++) {
          this.formItems.push({ no: i + 1, description: null, qty: 0, amount: 0, note: null });
        }
      } else if (count < currentCount) {
        this.formItems.splice(count);
      }
    },
    updateTotalAmount() {
      this.delivery.amount = this.formItems.reduce((total, item) => {
        return total + item.qty * item.amount;
      }, 0);
    },
    changeVendor() {
      this.delivery = {
        data: [],
        selectedDelivery: [],
        isLoading: false,
      };
      this.countInput = 1;
      this.formItems = [{ no: 1, description: null, qty: 0, amount: 0, note: null }];
    },
    setDefault() {
      this.vendors = {
        data: [],
        selectedVendor: null,
        isLoading: false,
      };
      this.ntb = {
        date: this.getCurrentDate(),
        status: 2,
        type: {
          selectedType: null,
          data: [],
        },
      };
      this.delivery = {
        data: [],
        selectedDelivery: [],
        isLoading: false,
      };
      this.countInput = 1;
      this.formItems = [{ no: 1, description: null, qty: 0, amount: 0, note: null }];
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
    saveAsDraft() {
      this.ntb.status = 1;
      this.saveNTB();
    },
    openModalCancel(id) {
      this.modal.ntbId = id;
      this.modal.action = 3;
      this.modal.cancel = true;
    },
    calculatePages() {
      const startPage = Math.max(1, this.mReceipt.current_page - 4);
      const endPage = Math.min(startPage + 8, this.mReceipt.last_page);

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
