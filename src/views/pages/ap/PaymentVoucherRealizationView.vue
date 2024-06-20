<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader>
        <strong>Realisasi Payment Vouchers</strong>
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
              <th>Tanggal Tempo</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>User</th>
              <th>User Realisasi</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mPayment && mPayment.data && mPayment.data.length > 0">
            <tr v-for="(pv, idx) in filteredData">
              <td>{{ idx + 1 }}</td>
              <td>{{ pv.pv_number }}</td>
              <td class="text-center">{{ formatDate(pv.pv_doc_date) }}</td>
              <td class="text-center">{{ formatDate(pv.pv_due_date) }}</td>
              <td>{{ `${pv.vendors.vend_code} | ${pv.vendors.vend_name}` }}</td>
              <td>{{ formatStatus(pv.payment_voucher_realizations?.pvr_status) }}</td>
              <td>{{ pv.users.name }}</td>
              <td>{{ pv.payment_voucher_realizations?.users.name }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="9" class="text-center">Tidak ada data.</td>
            </tr>
          </tbody>
        </table>
        <nav v-if="mPayment && mPayment.data && mPayment.data.length > 0" class="mt-2">
          <CButtonGroup role="group">
            <CButton type="button" color="secondary" variant="outline" :disabled="mPayment.current_page === 1" @click="getData(mPayment.current_page - 1)">&#60;</CButton>
            <template v-for="page in calculatePages()">
              <CButton type="button" color="secondary" variant="outline" @click="getData(page)" :class="{ active: page === mPayment.current_page }">{{ page }}</CButton>
            </template>
            <CButton type="button" color="secondary" variant="outline" :disabled="mPayment.current_page === mPayment.last_page" @click="getData(mPayment.current_page + 1)">&#62;</CButton>
          </CButtonGroup>
        </nav>
      </CCardBody>
    </CCard>
  </Pages>
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
import { format } from "date-fns";
import numeral from "numeral";
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
      user: JSON.parse(localStorage.getItem("user")),
      modal: {
        action: 1,
        detail: false,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      mPayment: [],
      keyword: "",
      filter: {
        perPage: "50",
        status: "7",
        dateStart: null,
        dateEnd: null,
      },
    };
  },
  computed: {
    filteredData() {
      if (this.keyword.trim() === "") {
        return this.mPayment.data;
      }

      const filtered = this.mPayment.data.filter((item) => {
        if (item && item.pv_number) {
          return item.pv_number.toLowerCase().includes(this.keyword.toLowerCase());
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
    formatDateOther(data) {
      return format(new Date(data), "yyyy-MM-dd");
    },
    formatDate(data) {
      return format(new Date(data), "dd-MM-yyyy");
    },
    formatAmount(number) {
      return numeral(number).format("0,0.00");
    },
    removeSelectedInvoice(index) {
      this.invoice.selectedInvoice.splice(index, 1);
      this.calculatePaymentTotals();
    },
    formatStatus(status) {
      const statusMap = {
        1: "Complete",
        2: "Canceled",
      };
      return statusMap[status] || "Pending";
    },
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPVR(this.filter, page);
        this.mPayment = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mPayment.total} data.`, "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
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
      const startPage = Math.max(1, this.mPayment.current_page - 4);
      const endPage = Math.min(startPage + 8, this.mPayment.last_page);

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
