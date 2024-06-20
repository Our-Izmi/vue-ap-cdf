<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader>
        <strong>Payment Voucher</strong>
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
              <th>Tanggal Tempo</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mPayment && mPayment.data && mPayment.data.length > 0">
            <tr v-for="(pv, idx) in mPayment.data">
              <td>{{ idx + 1 }}</td>
              <td>{{ pv.pv_number }}</td>
              <td class="text-center">{{ formatDate(pv.pv_doc_date) }}</td>
              <td class="text-center">{{ formatDate(pv.pv_due_date) }}</td>
              <td>{{ `${pv.vendors.vend_code} | ${pv.vendors.vend_name}` }}</td>
              <td>{{ formatStatus(pv.pv_status) }}</td>
              <td>{{ pv.users.name }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton v-c-tooltip="{ content: 'Export Docx', placement: 'top' }" color="secondary" @click="getDocx(pv.id)">
                    <CIcon icon="cil-arrow-thick-from-top" width="20" height="20" />
                  </CButton>
                  <CButton v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success" @click="getPVDetail(pv.id)">
                    <CIcon icon="cil-description" width="20" height="20" />
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
  <CModal
    fullscreen
    alignment="center"
    backdrop="static"
    :visible="modal.pva"
    @close="
      () => {
        modal.pva = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Detail Data</CModalTitle>
    </CModalHeader>
    <CModalBody v-if="pva">
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="pva.pv_number" label="Nomer Payment Voucher" placeholder="Nomer Payment Voucher" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(pva.pv_doc_date)" label="Tanggal Payment Voucher" placeholder="Tanggal Payment Voucher" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(pva.pv_due_date)" label="TanJatuh Tempo" placeholder="Tanggal Jatuh Tempo" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="`${pva.vendors.vend_code} | ${pva.vendors.vend_name}`" label="Nama Vendor" placeholder="Nama Vendor" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="pva.users.name" label="Nama User" placeholder="Nama User" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="formatStatus(pva.pv_status)" label="Status" placeholder="Status" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(pva.dpp_amount)" label="DPP Amount" placeholder="DPP Amount" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="`${pva.dpp_account || ''} | ${pva.vendor_accounts?.accdesc || ''}`" label="DPP Account" placeholder="DPP Account" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(pva.ppn_amount)" label="PPN Amount" placeholder="PPN Amount" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="`${pva.ppn_account || ''} | ${pva.tax_accounts?.dscription || ''}`" label="PPN Account" placeholder="PPN Account" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(pva.pph_amount)" label="PPH Amount" placeholder="PPH Amount" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="`${pva.pph_account || ''} | ${pva.pph_accounts?.accdesc || ''}`" label="PPH Account" placeholder="PPH Account" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea disabled :value="pva.pv_note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in pva.payment_voucher_invoices">
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="item.inv_number" type="text" label="Nomer Invoice" placeholder="Nomer Invoice" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="formatAmount(item.inv_amount)" type="text" label="Nilai Invoice" placeholder="Nilai Invoice" />
        </CCol>
      </CRow>
      <CRow v-for="(apv, index) in pva.approval_data_headers?.approvals">
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
        pvId: null,
        pva: false,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      pva: [],
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
  methods: {
    formatStatusUser(status) {
      const statusMap = {
        1: "Process",
        2: "Approved",
        3: "Rejected",
      };
      return statusMap[status] || "Unknown";
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
    async openModalNewPV() {
      try {
        this.$root.loader = true;
        const responseApprov = await ApiService.getApproval();
        this.payment.approval.data = responseApprov.data.map((apvh) => ({
          apvh_code: apvh.apvh_code,
          apvh_name: apvh.apvh_name,
          apvh_description: apvh.apvh_description,
          approval_users: apvh.approval_users,
        }));
        this.modal.pv = true;
        this.modal.action = 1;
      } catch (error) {
        this.getAlert("danger", "Error", "Terjadi error saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
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
    async getPVDetail(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPVDetail(id);
        this.pva = response.data;
        this.modal.pva = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async getDocx(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPVDocx(id);
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
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPV(this.filter, page);
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
