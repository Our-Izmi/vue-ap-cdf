<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader>
        <strong>Aging Payment Voucher</strong>
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

        <CRow class="mb-3">
          <CCol>
            <CInputGroup>
              <CButton v-c-tooltip="{ content: 'Filter data', placement: 'top' }" type="button" color="secondary" variant="outline" @click="getData()">
                <CIcon icon="cil-filter" width="24" height="24" />
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>

        <div style="max-width: 100%; overflow: auto">
          <table v-if="payments && payments.vendors" class="table table-hover table-striped table-bordered table-sm text-center align-middle">
            <thead class="table-secondary">
              <tr>
                <th>#</th>
                <th>Vendor Code</th>
                <th>Vendor</th>
                <th>Before</th>
                <th>{{ currentWednesday }}</th>
                <th>{{ after1 }}</th>
                <th>{{ after2 }}</th>
                <th>{{ after3 }}</th>
                <th>{{ after4 }}</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody class="text-start">
              <tr v-for="(mnt, idx) in payments.vendors">
                <td>
                  {{ idx + 1 }}
                </td>
                <td>
                  {{ mnt.vendor.vend_code }}
                </td>
                <td>
                  {{ mnt.vendor.vend_name }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.before) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.current) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.after1) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.after2) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.after3) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.after4) }}
                </td>
                <td>
                  {{ formatAmount(mnt.vendor.total) }}
                </td>
                <td class="text-center">
                  <CButtonGroup>
                    <CButton v-c-tooltip="{ content: 'Detail aging', placement: 'top' }" color="success" size="sm" @click="getDetail(mnt.vendor.vend_code)">
                      <CIcon icon="cil-description" width="20" height="20" />
                    </CButton>
                  </CButtonGroup>
                </td>
              </tr>
            </tbody>
            <tfoot class="text-start">
              <tr>
                <td class="text-center" colspan="3"><strong>Total</strong></td>
                <td>
                  <strong>{{ formatAmount(payments.before) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(payments.current) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(payments.after1) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(payments.after2) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(payments.after3) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(payments.after4) }}</strong>
                </td>
                <td colspan="2">
                  <strong>
                    {{ formatAmount(payments.total) }}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CCardBody>
    </CCard>
  </Pages>
  <CModal alignment="center" fullscreen backdrop="static" :visible="modal.detail" @close="closeModal">
    <CModalHeader v-if="payment">
      <CModalTitle>{{ payment?.vend_code }} | {{ payment?.vend_name }}</CModalTitle>
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
      <table class="table table-hover table-striped table-bordered table-sm text-start align-middle">
        <thead>
          <tr class="text-center table-danger">
            <th>Doc. Num.</th>
            <th>Doc. Date</th>
            <th>Due. Date</th>
            <th>Before</th>
            <th>{{ currentWednesday }}</th>
            <th>{{ after1 }}</th>
            <th>{{ after2 }}</th>
            <th>{{ after3 }}</th>
            <th>{{ after4 }}</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(category, index) in ['before', 'current', 'after1', 'after2', 'after3', 'after4']">
            <tr v-for="pv in payment?.paymentVouchers[category]">
              <td>{{ pv.pv_number }}</td>
              <td class="text-center">{{ formatDate(pv.pv_doc_date) }}</td>
              <td class="text-center">{{ formatDate(pv.pv_due_date) }}</td>
              <td v-for="(col, colIndex) in ['before', 'current', 'after1', 'after2', 'after3', 'after4']">
                {{ col === category ? formatAmount(pv.pv_amount) : "0.00" }}
              </td>
              <td>{{ formatAmount(pv.pv_amount) }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton @click="getPVDetail(pv.id)" v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success">
                    <CIcon icon="cil-description" width="20" height="20" />
                  </CButton>
                  <CButton @click="openModalRealisasi(pv.id)" v-c-tooltip="{ content: 'Realisasi', placement: 'top' }" color="primary">
                    <CIcon icon="cil-send" width="20" height="20" />
                  </CButton>
                </CButtonGroup>
              </td>
            </tr>
          </template>
          <tr>
            <td class="text-center" colspan="3"><strong>Sub. Total</strong></td>
            <td>
              <strong>{{ formatAmount(payment?.before) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(payment?.current) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(payment?.after1) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(payment?.after2) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(payment?.after3) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(payment?.after4) }}</strong>
            </td>
            <td colspan="2">
              <strong>{{ formatAmount(payment?.total) }}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </CModalBody>
  </CModal>
  <CModal
    fullscreen
    alignment="center"
    backdrop="static"
    :visible="modal.pva"
    @close="
      () => {
        modal.pva = false;
        modal.detail = true;
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
  </CModal>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.pvr"
    @close="
      () => {
        modal.pvr = false;
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Realisasi Payment Voucher</CModalTitle>
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
        <CCol md="4" class="mb-3">
          <CFormInput type="text" v-model="pvr.number" label="Nomer Voucher" placeholder="Nomer Voucher" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput type="date" v-model="pvr.relDate" label="Tanggal Realisasi" placeholder="Tanggal Realisasi" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormSelect v-model="pvr.bank" label="Bank">
            <option value="">Pilih Bank</option>
            <option v-for="bank in banks" :value="bank.id">
              {{ bank.bankname }}
            </option>
          </CFormSelect>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea :v-model="pvr.note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton @click="validPVR" v-c-tooltip="{ content: 'Simpan', placement: 'top' }" color="success">
        <CIcon icon="cil-send" width="24" height="24" />
      </CButton>
    </CModalFooter>
  </CModal>
  <CModal
    :visible="modal.confirmFirst"
    alignment="center"
    backdrop="static"
    @close="
      () => {
        (modal.confirmFirst = false), (modal.pvr = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Simpan realisasi payment voucher?</CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (modal.confirmSecond = true), (modal.action = 1), (pvr.status = 1), (modal.secondMessage = 'Apakah anda yakin akan menyelesaikan realisasi payment voucher?');
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
            (modal.confirmFirst = false), (modal.confirmSecond = true), (modal.action = 2), (pvr.status = 2), (modal.secondMessage = 'Apakah anda yakin akan membatalkan payment voucher?');
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
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="savePVR()" color="success">
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
  mounted() {
    this.calculateDates();
  },
  data() {
    return {
      title: "A/P GENERAL",
      user: JSON.parse(localStorage.getItem("user")),
      modal: {
        pvId: null,
        action: 1,
        detail: false,
        payment: false,
        pva: false,
        pvr: false,
        confirmFirst: false,
        confirmSecond: false,
        secondMessage: "",
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      pvr: {
        status: 1,
        number: null,
        relDate: null,
        note: null,
        bank: null,
      },
      banks: [],
      pva: [],
      payments: [],
      payment: [],
      currentWednesday: "",
      after1: "",
      after2: "",
      after3: "",
      after4: "",
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
    calculateDates() {
      const today = new Date();
      const currentDay = today.getDay();
      const daysToWednesday = (3 - currentDay + 7) % 7;
      const currentWednesday = new Date(today);
      currentWednesday.setDate(today.getDate() + daysToWednesday);

      this.currentWednesday = this.formatDate(currentWednesday);
      for (let i = 1; i <= 4; i++) {
        const nextWednesday = new Date(currentWednesday);
        nextWednesday.setDate(currentWednesday.getDate() + 7 * i);
        this[`after${i}`] = this.formatDate(nextWednesday);
      }
    },
    formatDate(data) {
      return format(new Date(data), "dd-MM-yyyy");
    },
    formatAmount(number) {
      return numeral(number).format("0,0.00");
    },
    async getDetail(vend_code) {
      try {
        this.alert.visibleOnMain = false;
        this.$root.loader = true;
        const response = await ApiService.getPayments(vend_code);
        this.payment = response.data;
        this.modal.detail = true;
      } catch (error) {
        this.getAlert("danger", "Error!", error.message, "main");
        console.error("Error fetching data:", error);
      } finally {
        this.$root.loader = false;
      }
    },
    async getPVDetail(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPVDetail(id);
        this.pva = response.data;
        this.modal.pva = true;
        this.modal.detail = false;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async allBank() {
      try {
        this.$root.loader = true;
        const response = await ApiService.allBank();
        this.banks = response.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async savePVR() {
      try {
        this.$root.loader = true;
        const data = {
          pvr_number: this.pvr.number,
          pvr_status: this.pvr.status,
          pvr_rel_date: this.pvr.relDate,
          bank_id: this.pvr.bank,
          pvr_note: this.pvr.note,
          user_id: this.user.id,
        };
        if (this.modal.action == 1) {
          const response = await ApiService.savePVR(data, this.modal.pvId);
        } else if (this.modal.action == 2) {
          const userId = { user: this.user.id };
          const response = await ApiService.cancelPVR(userId, this.modal.pvId);
        }
        this.getAlert("success", "Success", "Berhasil menyimpan payment voucher.", "main");
        this.getData();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan payment voucher.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirmFirst = false;
        this.modal.confirmSecond = false;
      }
    },
    async openModalRealisasi(id) {
      await this.allBank();
      this.modal.pvId = id;
      this.modal.pvr = true;
      this.modal.detail = false;
    },
    validPVR() {
      this.alert.visibleOnModal = false;

      const isFieldEmpty = (field) => field === undefined || field === null || field === "";

      const showAlertForEmptyField = (fieldName) => {
        let message = "";

        switch (fieldName) {
          case "number":
            message = "Nomor harus diisi.";
            break;
          case "status":
            message = "Status harus diisi.";
            break;
          case "relDate":
            message = "Tanggal harus diisi.";
            break;
          case "bank":
            message = "Bank harus dipilih.";
            break;
          default:
            message = "Field harus diisi.";
        }

        this.getAlert("danger", "Error", message, "modal");
      };

      if (isFieldEmpty(this.pvr.number)) {
        showAlertForEmptyField("number");
      } else if (isFieldEmpty(this.pvr.status)) {
        showAlertForEmptyField("status");
      } else if (isFieldEmpty(this.pvr.relDate)) {
        showAlertForEmptyField("relDate");
      } else if (isFieldEmpty(this.pvr.bank)) {
        showAlertForEmptyField("bank");
      } else {
        this.modal.confirmFirst = true;
        this.modal.pvr = false;
      }
    },
    closeModal() {
      this.modal.detail = false;
    },
    async getData() {
      try {
        this.alert.visibleOnMain = false;
        this.$root.loader = true;
        const response = await ApiService.getAgingPayment();
        this.payments = response.data;
      } catch (error) {
        this.getAlert("danger", "Error!", error.message, "main");
        console.error("Error fetching data:", error);
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
  },
};
</script>
