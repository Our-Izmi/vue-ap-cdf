<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader>
        <strong>Approval Payment Voucher</strong>
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
                <option value="2">Waiting</option>
                <option value="4">Approved</option>
                <option value="5">Rejected</option>
              </CFormSelect>
              <CButton v-c-tooltip="{ content: 'Filter data', placement: 'top' }" type="button" color="secondary" variant="outline" @click="getData">
                <CIcon icon="cil-filter" width="24" height="24" />
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>
        <table class="table table-hover table-bordered table-striped table-sm">
          <thead class="align-middle text-center">
            <tr class="table-secondary">
              <th>#</th>
              <th>Number</th>
              <th>Nilai</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mPayment && mPayment.data && mPayment.data.length > 0">
            <tr v-for="(pv, idx) in mPayment.data">
              <td>{{ idx + 1 }}</td>
              <td>{{ pv.pv_number }}</td>
              <td>{{ formatAmount(pv.pv_amount) }}</td>
              <td>{{ formatDate(pv.pv_doc_date) }}</td>
              <td>{{ formatStatus(pv.pv_status) }}</td>
              <td>{{ formatApv(pv.approval_data_headers.approvals[0].apv_status, pv.approval_data_headers.approvals[0].apv_open) }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton
                    :disabled="pv.pv_status != 2 || pv.approval_data_headers.approvals[0].apv_status != 1 || pv.approval_data_headers.approvals[0].apv_open != 1"
                    v-c-tooltip="{ content: 'Edit', placement: 'top' }"
                    :color="pv.pv_status != 2 ? (pv.pv_status != 6 ? (pv.pv_status == 4 ? 'primary' : 'danger') : 'secondary') : 'success'"
                    @click="getDetail(pv.id)"
                  >
                    <CIcon icon="cil-pen" width="20" height="20" />
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
      <CRow v-for="(item, index) in pva.payment_voucher_invoices">
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="item.inv_number" type="text" label="Nomer Invoice" placeholder="Nomer Invoice" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput disabled :value="formatAmount(item.inv_amount)" type="text" label="Nilai Invoice" placeholder="Nilai Invoice" />
        </CCol>
      </CRow>
      <CRow v-for="(apv, index) in pva.approval_data_headers.approvals">
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
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = true), (modal.detail = false);
          }
        "
      >
        <CIcon icon="cil-arrow-thick-to-top" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    :visible="modal.confirmFirst"
    alignment="center"
    backdrop="static"
    size="xl"
    @close="
      () => {
        (modal.confirmFirst = false), (modal.detail = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CRow>
        <CCol md="12">
          <CFormTextarea v-model="result.note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (result.status = 2), (modal.confirmSecond = true), (modal.secondMessage = 'Apakah anda yakin akan menyetujui nota terima barang?');
          }
        "
      >
        <CIcon icon="cil-arrow-thick-to-top" width="24" height="24" />
      </CButton>
      <CButton
        v-c-tooltip="{ content: 'Cancel', placement: 'top' }"
        color="danger"
        @click="
          () => {
            (modal.confirmFirst = false), (result.status = 3), (modal.confirmSecond = true), (modal.secondMessage = 'Apakah anda yakin akan menolak nota terima barang?');
          }
        "
      >
        <CIcon icon="cil-x-circle" width="24" height="24" />
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
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveApproval()" color="success">
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
import { format } from "date-fns";
import numeral from "numeral";

export default {
  components: {
    Pages,
  },
  data() {
    return {
      title: "A/P GENERAL",
      modal: {
        pvID: null,
        detail: false,
        confirmFirst: false,
        confirmSecond: false,
        secondMessage: "",
      },
      result: {
        status: 2,
        note: null,
      },
      mPayment: [],
      pva: [],
      user: JSON.parse(localStorage.getItem("user")),
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      filter: {
        perPage: "50",
        status: "7",
      },
    };
  },
  methods: {
    formatAmount(number) {
      return numeral(number).format("0,0.00");
    },
    formatDate(data) {
      return format(new Date(data), "dd-MM-yyyy");
    },
    formatStatusUser(status) {
      const statusMap = {
        1: "Process",
        2: "Approved",
        3: "Rejected",
      };
      return statusMap[status] || "Unknown";
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
    formatApv(status, open) {
      if (status === 1) {
        if (open === 0) {
          return "Waiting";
        } else if (open === 1) {
          return "Open";
        }
      }

      const statusMap = {
        2: "Approved",
        3: "Rejected",
      };

      return statusMap[status] || "Unknown";
    },
    async getData(page = 1) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPVForApprove(page, this.user.id, this.filter);
        this.mPayment = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mPayment.total} data.`, "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async getDetail(id) {
      try {
        this.modal.pvID = id;
        this.$root.loader = true;
        const response = await ApiService.getPVDetail(id);
        this.pva = response.data;
        this.modal.detail = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async saveApproval() {
      try {
        this.$root.loader = true;
        const data = {
          apv_status: this.result.status,
          apv_note: this.result.note,
          user_id: this.user.id,
        };
        const response = await ApiService.saveApprovalPV(this.modal.pvID, data);
        this.getData();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan data.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirmSecond = false;
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
