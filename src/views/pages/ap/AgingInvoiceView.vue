<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader>
        <strong>Aging Invoice</strong>
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
          <table v-if="invoices && invoices.vendors" class="table table-hover table-striped table-bordered table-sm text-center align-middle">
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
              <tr v-for="(mnt, idx) in invoices.vendors">
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
                  <strong>{{ formatAmount(invoices.before) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(invoices.current) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(invoices.after1) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(invoices.after2) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(invoices.after3) }}</strong>
                </td>
                <td>
                  <strong>{{ formatAmount(invoices.after4) }}</strong>
                </td>
                <td colspan="2">
                  <strong>
                    {{ formatAmount(invoices.total) }}
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
    <CModalHeader v-if="invoice">
      <CModalTitle>{{ invoice?.vend_code }} | {{ invoice?.vend_name }}</CModalTitle>
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
        <CCol md="12" class="mb-3">
          <CInputGroup>
            <CInputGroupText>Total Payment Voucher</CInputGroupText>
            <CFormInput :value="formatAmount(selectedTotal)" type="text" />
            <CButton v-c-tooltip="{ content: 'Tambah Invoice', placement: 'top' }" variant="outline" @click="newPayment(invoice?.vend_code)" color="success">
              <CIcon icon="cil-note-add" width="24" height="24" />
            </CButton>
          </CInputGroup>
        </CCol>
      </CRow>
      <table class="table table-hover table-striped table-bordered table-sm text-start align-middle">
        <thead>
          <tr class="text-center table-danger">
            <th>Pay</th>
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
          </tr>
        </thead>
        <tbody>
          <template v-for="(category, index) in ['before', 'current', 'after1', 'after2', 'after3', 'after4']">
            <tr v-for="inv in invoice?.invoices[category]" :key="inv.inv_number + category">
              <td class="text-center">
                <CFormCheck :value="inv.inv_number" v-model="selectedInvoices" />
              </td>
              <td>{{ inv.inv_number }}</td>
              <td class="text-center">{{ formatDate(inv.inv_doc_date) }}</td>
              <td class="text-center">{{ formatDate(inv.inv_due_date) }}</td>
              <td v-for="(col, colIndex) in ['before', 'current', 'after1', 'after2', 'after3', 'after4']">
                {{ col === category ? formatAmount(inv.inv_not_payed) : "0.00" }}
              </td>
              <td>{{ formatAmount(inv.inv_not_payed) }}</td>
            </tr>
          </template>
          <tr>
            <td colspan="2">
              <strong>{{ formatAmount(selectedTotal) }}</strong>
            </td>
            <td class="text-center" colspan="2"><strong>Sub. Total</strong></td>
            <td>
              <strong>{{ formatAmount(invoice?.before) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.current) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.after1) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.after2) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.after3) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.after4) }}</strong>
            </td>
            <td>
              <strong>{{ formatAmount(invoice?.total) }}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </CModalBody>
  </CModal>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.payment"
    @close="
      () => {
        modal.payment = false;
        modal.detail = true;
        setDefaultPayment();
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Payment Voucher</CModalTitle>
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
        <CCol md="12" class="mb-3">
          <CFormInput type="date" v-model="payment.dueDate" label="Tanggal Jatuh Tempo" placeholder="Tanggal Jatuh Tempo" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="4" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.accountDppDesc" label="Account DPP" placeholder="Account DPP" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.accountPpnDesc" label="Account PPN" placeholder="Account PPN" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.accountPphDesc" label="Account PPH" placeholder="Account PPH" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="3" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.dpp" label="Nilai DPP" placeholder="Nilai DPP" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.ppn" label="Nilai PPN" placeholder="Nilai PPN" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.pph" label="Nilai PPH" placeholder="Nilai PPH" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput type="text" disabled v-model="payment.total" label="Nilai Total" placeholder="Nilai Total" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea :v-model="payment.note" type="text" label="Note" placeholder="Note"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Simpan', placement: 'top' }" color="success" @click="validPV">
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
        (modal.confirmFirst = false), (modal.payment = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Simpan payment voucher?</CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (modal.confirmSecond = true), (modal.secondMessage = 'Apakah anda yakin akan menyelesaikan payment voucher?');
          }
        "
      >
        <CIcon icon="cil-arrow-thick-to-top" width="24" height="24" />
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
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="savePV()" color="success">
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
  watch: {
    selectedInvoices: "calculateSelectedTotal",
  },
  data() {
    return {
      title: "A/P GENERAL",
      user: JSON.parse(localStorage.getItem("user")),
      modal: {
        detail: false,
        payment: false,
        confirmFirst: false,
        confirmSecond: false,
        secondMessage: null,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      payment: {
        status: 1,
        dueDate: null,
        accountDpp: null,
        accountPpn: null,
        accountPph: null,
        accountDppDesc: null,
        accountPpnDesc: null,
        accountPphDesc: null,
        dpp: 0,
        ppn: 0,
        pph: 0,
        total: 0,
        note: null,
        approval: {
          selectedApproval: [],
          data: [],
        },
      },
      invoices: [],
      invoice: [],
      currentWednesday: "",
      after1: "",
      after2: "",
      after3: "",
      after4: "",
      selectedInvoices: [],
      selectedTotal: 0,
    };
  },
  methods: {
    newPayment(code) {
      this.payment.vendCode = code;
      if (this.selectedInvoices.length > 0) {
        this.modal.detail = false;
        this.modal.payment = true;
        this.setData();
      } else {
        this.getAlert("danger", "Error!", "Tidak ada invoice yang dipilih.", "modal");
      }
    },
    setDefaultPayment() {
      this.payment = {
        vendCode: null,
        dueDate: null,
        accountDpp: null,
        accountPpn: null,
        accountPph: null,
        accountDppDesc: null,
        accountPpnDesc: null,
        accountPphDesc: null,
        dpp: 0,
        ppn: 0,
        pph: 0,
        total: 0,
        note: null,
        approval: {
          selectedApproval: [],
          data: [],
        },
      };
    },
    closeModal() {
      this.modal.detail = false;
      this.selectedInvoices = [];
      this.selectedTotal = 0;
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
        const response = await ApiService.getInvoices(vend_code);
        this.invoice = response.data;
        this.modal.detail = true;
      } catch (error) {
        this.getAlert("danger", "Error!", error.message, "main");
        console.error("Error fetching data:", error);
      } finally {
        this.$root.loader = false;
      }
    },
    calculateSelectedTotal() {
      this.selectedTotal = this.invoice.invoices.before
        .concat(this.invoice.invoices.current, this.invoice.invoices.after1, this.invoice.invoices.after2, this.invoice.invoices.after3, this.invoice.invoices.after4)
        .filter((inv) => this.selectedInvoices.includes(inv.inv_number))
        .reduce((sum, inv) => sum + parseFloat(inv.inv_not_payed), 0);
      this.payment.ppn = this.invoice.invoices.before
        .concat(this.invoice.invoices.current, this.invoice.invoices.after1, this.invoice.invoices.after2, this.invoice.invoices.after3, this.invoice.invoices.after4)
        .filter((inv) => this.selectedInvoices.includes(inv.inv_number))
        .reduce((sum, inv) => sum + parseFloat(inv.ppn_amount), 0);
      this.payment.pph = this.invoice.invoices.before
        .concat(this.invoice.invoices.current, this.invoice.invoices.after1, this.invoice.invoices.after2, this.invoice.invoices.after3, this.invoice.invoices.after4)
        .filter((inv) => this.selectedInvoices.includes(inv.inv_number))
        .reduce((sum, inv) => sum + parseFloat(inv.pph_amount), 0);
      this.payment.dpp = this.invoice.invoices.before
        .concat(this.invoice.invoices.current, this.invoice.invoices.after1, this.invoice.invoices.after2, this.invoice.invoices.after3, this.invoice.invoices.after4)
        .filter((inv) => this.selectedInvoices.includes(inv.inv_number))
        .reduce((sum, inv) => sum + parseFloat(inv.dpp_amount), 0);
    },
    async getData() {
      try {
        this.alert.visibleOnMain = false;
        this.$root.loader = true;
        const response = await ApiService.getAging();
        this.invoices = response.data;
      } catch (error) {
        this.getAlert("danger", "Error!", error.message, "main");
        console.error("Error fetching data:", error);
      } finally {
        this.$root.loader = false;
      }
    },
    validPV() {
      this.alert.visibleOnModal = false;
      const isFieldEmpty = (field) => field === undefined || field === null || field === "";

      let errorMessage = "";

      if (isFieldEmpty(this.payment.dueDate)) {
        errorMessage = "Tanggal jatuh tempo harus diisi.";
      }

      if (errorMessage !== "") {
        this.getAlert("danger", "Error", errorMessage, "modal");
      } else {
        this.modal.confirmFirst = true;
        this.modal.payment = false;
      }
    },
    async savePV() {
      try {
        this.$root.loader = true;
        const data = {
          vend_code: this.payment.vendCode,
          dpp_account: this.payment.accountDpp,
          ppn_account: this.payment.accountPpn,
          pph_account: this.payment.accountPph,
          pv_status: 2,
          pv_due_date: this.payment.dueDate,
          ppn_amount: this.payment.ppn,
          pph_amount: this.payment.pph,
          dpp_amount: this.payment.dpp,
          pv_amount: this.payment.total,
          pv_note: this.payment.note,
          inv_data: this.selectedInvoices,
          user_id: this.user.id,
        };
        const response = await ApiService.savePV(data);
        this.getData();
        this.getAlert("success", "Success", "Berhasil menyimpan payment voucher.", "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan payment voucher.", "main");
      } finally {
        this.setDefaultPayment();
        this.$root.loader = false;
        this.modal.confirmFirst = false;
        this.modal.confirmSecond = false;
      }
    },
    setData() {
      const invoices = [...this.invoice.invoices.before, ...this.invoice.invoices.current, ...this.invoice.invoices.after1, ...this.invoice.invoices.after2, ...this.invoice.invoices.after3, ...this.invoice.invoices.after4];

      const invoicesWithPpn = invoices.filter((inv) => {
        return this.selectedInvoices.includes(inv.inv_number) && inv.ppn_type === 1;
      });

      const invoicesWithPph = invoices.filter((inv) => {
        return this.selectedInvoices.includes(inv.inv_number) && inv.pph_type === 1;
      });

      if (invoicesWithPph.length > 0) {
        const firstInvoiceWithPph = invoicesWithPph[0];
        this.payment.accountPph = firstInvoiceWithPph.pph_accounts.acccode;
        this.payment.accountPphDesc = `${firstInvoiceWithPph.pph_accounts.acccode} | ${firstInvoiceWithPph.pph_accounts.accdesc}`;
      } else {
        this.payment.accountPph = null;
        this.payment.accountPphDesc = "";
      }

      if (invoicesWithPpn.length > 0) {
        this.payment.accountPpn = this.invoice.ppn[0].liablyacccode;
        this.payment.accountPpnDesc = `${this.invoice.ppn[0].liablyacccode} | PPN`;
      } else {
        this.payment.accountPpn = this.invoice.ppn[1].liablyacccode;
        this.payment.accountPpnDesc = `${this.invoice.ppn[1].liablyacccode} | NON PPN`;
      }

      this.payment.total = this.selectedTotal;
      this.payment.accountDpp = this.invoice.account;
      this.payment.accountDppDesc = `${this.invoice?.account} | ${this.invoice?.dpp?.accdesc}`;
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
