<template>
  <Pages :title="title">
    <CCard class="mb-4">
      <CCardHeader class="d-flex justify-content-between align-items-center">
        <strong>Invoice</strong>
        <CButton v-c-tooltip="{ content: 'Tambah Invoice', placement: 'top' }" @click="openModalNewInvoice" color="success">
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
                <option value="4">All</option>
                <option value="1">Draft</option>
                <option value="2">Complete</option>
                <option value="3">Canceled</option>
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
              <th>Dasar</th>
              <th>Nomer</th>
              <th>Doc. Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>User</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody class="align-middle text-start" v-if="mInvoice && mInvoice.data && mInvoice.data.length > 0">
            <tr v-for="(inv, idx) in filteredData">
              <td>{{ idx + 1 }}</td>
              <td>{{ formatType(inv.inv_type) }}</td>
              <td>{{ inv.inv_number }}</td>
              <td class="text-center">{{ formatDate(inv.inv_doc_date) }}</td>
              <td class="text-center">{{ formatDate(inv.inv_due_date) }}</td>
              <td>{{ formatAmount(inv.inv_amount) }}</td>
              <td>{{ `${inv.vendors.vend_code} | ${inv.vendors.vend_name}` }}</td>
              <td>{{ formatStatus(inv.inv_status) }}</td>
              <td>{{ inv.users.name }}</td>
              <td class="text-center">
                <CButtonGroup>
                  <CButton v-c-tooltip="{ content: 'Detail', placement: 'top' }" color="success" @click="getDetail(inv.id)">
                    <CIcon icon="cil-description" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="inv.inv_status != 1" v-c-tooltip="{ content: 'Edit', placement: 'top' }" color="primary" @click="getEdit(inv.id)">
                    <CIcon icon="cil-pen" width="20" height="20" />
                  </CButton>
                  <CButton :disabled="inv.inv_status != 1" v-c-tooltip="{ content: 'Cancel', placement: 'top' }" color="danger" @click="openCancelInv(inv.id)">
                    <CIcon icon="cil-x-circle" width="24" height="24" />
                  </CButton>
                </CButtonGroup>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="10" class="text-center">Tidak ada data.</td>
            </tr>
          </tbody>
        </table>
        <nav v-if="mInvoice && mInvoice.data && mInvoice.data.length > 0" class="mt-2">
          <CButtonGroup role="group">
            <CButton type="button" color="secondary" variant="outline" :disabled="mInvoice.current_page === 1" @click="getData(mInvoice.current_page - 1)">&#60;</CButton>
            <template v-for="page in calculatePages()">
              <CButton type="button" color="secondary" variant="outline" @click="getData(page)" :class="{ active: page === mInvoice.current_page }">{{ page }}</CButton>
            </template>
            <CButton type="button" color="secondary" variant="outline" :disabled="mInvoice.current_page === mInvoice.last_page" @click="getData(mInvoice.current_page + 1)">&#62;</CButton>
          </CButtonGroup>
        </nav>
      </CCardBody>
    </CCard>
  </Pages>
  <CModal
    size="xl"
    alignment="center"
    backdrop="static"
    :visible="modal.invoice"
    @close="
      () => {
        modal.invoice = false;
        setDefault();
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Form Input Invoice</CModalTitle>
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
          <CFormSelect
            @change="
              () => {
                po.selectedPO = [];
                rn.selectedRN = null;
              }
            "
            v-model="invoice.type"
            label="Dasar"
          >
            <option value="2">Nota Terima Barang</option>
            <option value="1">Purchase Order</option>
            <option value="3">Lainya</option>
          </CFormSelect>
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput type="date" v-model="invoice.dateReceipt" label="Tanggal Terima invoice" placeholder="Tanggal Terima invoice" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Vendor</label>
          <v-select v-if="invoice.type == 1 || invoice.type == 3" :disabled="invoice.type != 3 && invoice.type != 1" v-model="vendors.selectedVendor" :options="vendors.data" :filterable="true" label="id_vendname" @search="searchVendors" :loading="vendors.isLoading"></v-select>
          <v-select v-if="invoice.type == 2" @option:selected="setAccountVendor()" :disabled="!invoice.type || invoice.type != 2" v-model="vendors.selectedVendor" :options="vendors.data" :filterable="true" label="id_vendname" @search="searchVendorsGeneral" :loading="vendors.isLoading"></v-select>
          <v-select v-if="invoice.type != 2 && invoice.type != 1 && invoice.type != 3" disabled></v-select>
        </CCol>
        <CCol md="6" class="mb-3">
          <label v-if="invoice.type == 1" class="mb-2">Nomer Purchase Order</label>
          <v-select v-if="invoice.type == 1" :disabled="!vendors.selectedVendor" v-model="po.selectedPO" :options="po.data" :filterable="true" label="po_no" @search="searchPO" :loading="po.isLoading"></v-select>
          <label v-if="invoice.type == 2" class="mb-2">Nomer Nota Terima Barang</label>
          <v-select v-if="invoice.type == 2" :disabled="!vendors.selectedVendor" v-model="rn.selectedRN" :options="rn.data" :filterable="true" label="rn_number" @search="searchRN" @option:selected="setData()" :loading="rn.isLoading"></v-select>
          <CFormInput v-if="invoice.type == 3" type="text" v-model="invoice.reference" label="Referensi" placeholder="Referensi" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Account DPP</label>
          <v-select :disabled="!vendors.selectedVendor" v-model="vendorAccounts.selectedVendorAccounts" :options="vendorAccounts.data" :filterable="true" label="acc_desc" @search="searchVendorAccounts" :loading="vendorAccounts.isLoading"></v-select>
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormSelect v-model="invoice.typePPN" label="Type PPN">
            <option value="2">Tanpa PPN</option>
            <option value="1">Dengan PPN</option>
          </CFormSelect>
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormSelect v-model="invoice.typePPH" label="Type PPH">
            <option value="2">Tanpa PPH</option>
            <option value="1">Dengan PPH</option>
          </CFormSelect>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <CFormInput type="text" v-model="invoice.number" label="Nomer Invoice" placeholder="Nomer Invoice" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput type="date" v-model="invoice.docDate" label="Tanggal Invoice" placeholder="Tanggal Invoice" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput :disabled="!invoice.dateReceipt" type="number" v-model="invoice.dueDay" label="Rentang Waktu" placeholder="Rentang Waktu" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput :disabled="!invoice.dateReceipt" type="date" v-model="invoice.dueDate" label="Jatuh Tempo Invoice" placeholder="Jatuh Tempo Invoice" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <CFormInput :disabled="invoice.typePPN == 2" v-model="invoice.ppnNumber" type="text" label="Nomer PPN" placeholder="Nomer PPN" />
        </CCol>
        <CCol md="6" class="mb-3">
          <CFormInput :disabled="invoice.typePPH == 2" v-model="invoice.pphNumber" type="text" label="Nomer PPH" placeholder="Nomer PPH" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="mb-3">
          <CFormInput v-if="invoice.typePPN == 1" disabled type="text" :value="`${ppnAccounts[0].liablyacccode} | PPN`" label="Account Ppn" placeholder="Account Ppn" />
          <CFormInput v-if="invoice.typePPN == 2" disabled type="text" :value="`${ppnAccounts[1].liablyacccode} | NON PPN`" label="Account Ppn" placeholder="Account Ppn" />
        </CCol>
        <CCol md="6" class="mb-3">
          <label class="mb-2">Account PPH</label>
          <v-select :disabled="invoice.typePPH == 2" v-model="invoice.pphAccount" :options="vendorAccounts.data" :filterable="true" label="acc_desc" @search="searchVendorAccounts" :loading="vendorAccounts.isLoading"></v-select>
        </CCol>
      </CRow>
      <CRow>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="number" v-model="invoice.amountItems" label="Total Nilai Barang" placeholder="Total Nilai Barang" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="number" v-model="invoice.ppnAmount" :label="`Nilai Ppn ${invoice.perPPN}%`" :placeholder="`Nilai Ppn ${invoice.perPPN}%`" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="number" v-model="invoice.pphAmount" :label="`Nilai Pph ${invoice.perPPH}%`" :placeholder="`Nilai Pph ${invoice.perPPH}%`" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="number" label="Total Nilai Invoice" v-model="invoice.amountTotal" placeholder="Total Nilai Invoice" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea v-model="invoice.note" type="text" label="Catatan" placeholder="Catatan"></CFormTextarea>
        </CCol>
      </CRow>
    </CModalBody>
    <CModalFooter>
      <CButton
        :disabled="invoice.type == 1 || invoice.type == 3 ? false : !rn.selectedRN || !rn.selectedRN.rn_number"
        v-c-tooltip="{ content: 'Tambah Barang', placement: 'top' }"
        @click="
          () => {
            modal.barang = true;
            modal.invoice = false;
          }
        "
        color="secondary"
      >
        <CIcon icon="cil-inbox" :width="20" :height="20" />
      </CButton>
      <CButton @click="validInvoice" v-c-tooltip="{ content: 'Simpan', placement: 'top' }" color="success">
        <CIcon icon="cil-send" :width="20" :height="20" />
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
        modal.invoice = true;
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
          <CFormInput disabled type="number" v-model="invoice.amountItems" label="Total Nilai Barang" placeholder="Total Nilai Barang" />
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
          <CFormInput disabled v-model="item.subTotal" type="text" label="Sub Total" placeholder="Sub Total" />
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
        (modal.confirmFirst = false), (modal.invoice = true);
      }
    "
  >
    <CModalHeader>
      <CModalTitle>Konfirmasi</CModalTitle>
    </CModalHeader>
    <CModalBody>Simpan invoice?</CModalBody>
    <CModalFooter>
      <CButton
        v-c-tooltip="{ content: 'Complete', placement: 'top' }"
        color="success"
        @click="
          () => {
            (modal.confirmFirst = false), (modal.confirmSecond = true), (invoice.status = 2), (modal.secondMessage = 'Apakah anda yakin akan menyelesaikan invoice?');
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
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="saveInvoice()" color="success">
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
    <CModalBody v-if="invDetail">
      <CRow>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatRef(invDetail.inv_type)" label="Dasar" placeholder="Dasar" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput v-if="invDetail.inv_type == 2" disabled type="text" :value="invDetail.rn_number" label="Nomer Nota Terima Barang" placeholder="Nomer Nota Terima Barang" />
          <CFormInput v-if="invDetail.inv_type == 1" disabled type="text" :value="invDetail.po_number" label="Nomer Purchase Order" placeholder="Nomer Purchase Order" />
          <CFormInput v-if="invDetail.inv_type == 3" disabled type="text" :value="invDetail.ref_number" label="Referensi" placeholder="Referensi" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="invDetail.inv_number" label="Nomer Invoice" placeholder="Nomer Invoice" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="invDetail.ppn_number" label="Nomer Faktur Pajak" placeholder="Nomer Faktur Pajak" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="invDetail.pph_number" label="Nomer PPH" placeholder="Nomer PPH" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(invDetail.inv_receipt_date)" label="Tanggal Terima Invoice" placeholder="Tanggal Terima Invoice" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="`${invDetail.vendors.vend_code} | ${invDetail.vendors.vend_name}`" label="Nama Vendor" placeholder="Nama Vendor" />
        </CCol>
        <CCol md="4" class="mb-3">
          <CFormInput disabled type="text" :value="`${invDetail.dpp_account} | ${invDetail.vendor_accounts?.accdesc}`" label="Account DPP" placeholder="Account DPP" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="invDetail.users.name" label="User" placeholder="User" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(invDetail.inv_doc_date)" label="Tanggal Dokumen Invoice" placeholder="Tanggal Dokumen Invoice" />
        </CCol>
        <CCol md="2" class="mb-3">
          <CFormInput disabled type="text" :value="formatDate(invDetail.inv_due_date)" label="Tanggal Jatuh Tempo Invoice" placeholder="Tanggal Jatuh Tempo Invoice" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatPPN(invDetail.ppn_type)" label="Jenis PPN" placeholder="Jenis PPN" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="`${invDetail.ppn_account} | ${invDetail.tax_accounts.dscription}`" label="Account PPN" placeholder="Account PPN" />
        </CCol>
        <CCol md="1" class="mb-3">
          <CFormInput disabled type="text" :value="formatPPH(invDetail.pph_type)" label="Jenis PPh" placeholder="Jenis PPh" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="invDetail.pph_type == 1 ? `${invDetail.pph_account} | ${invDetail.pph_accounts?.accdesc}` : null" label="Account PPH" placeholder="Account PPH" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(invDetail.dpp_amount)" label="Nilai DPP" placeholder="Nilai DPP" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(invDetail.ppn_amount)" label="Nilai PPN" placeholder="Nilai PPN" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(invDetail.pph_amount)" label="Nilai PPH" placeholder="Nilai PPH" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled type="text" :value="formatAmount(invDetail.inv_amount)" label="Nilai Total" placeholder="Nilai Total" />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="12" class="mb-3">
          <CFormTextarea disabled type="text" label="Note" placeholder="Note">{{ invDetail.inv_note }}</CFormTextarea>
        </CCol>
      </CRow>
      <CRow v-for="(item, index) in invDetail.inv_description">
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
          <CFormInput disabled :value="item.amount" type="text" label="Harga" placeholder="Harga" />
        </CCol>
        <CCol md="3" class="mb-3">
          <CFormInput disabled :value="item.subTotal" type="text" label="Sub Total" placeholder="Sub Total" />
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
    <CModalBody>Apakah anda yakin akan membatalkan invoice?</CModalBody>
    <CModalFooter>
      <CButton v-c-tooltip="{ content: 'Confirm', placement: 'top' }" @click="cancelInv" color="success">
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
        this.updateTotalAmountItems();
      },
      deep: true,
    },
    "invoice.ppnAmount"(newVal) {
      this.updateSubTotals();
      this.updateTotalAmount();
      this.updateTotalAmountItems();
    },
    "invoice.amountItems"(newVal) {
      this.updateSubTotals();
      this.updateTotalAmount();
      this.updateTotalAmountItems();
    },
    "invoice.pphAmount"(newVal) {
      this.updateSubTotals();
      this.updateTotalAmount();
      this.updateTotalAmountItems();
    },
    "invoice.typePPN"(newVal) {
      this.updateSubTotals();
      this.updateTotalAmount();
      this.updateTotalAmountItems();
    },
    "invoice.typePPH"(newVal) {
      this.updateSubTotals();
      this.updateTotalAmount();
      this.updateTotalAmountItems();
    },
    "invoice.dateReceipt": {
      handler(newValue) {
        this.calculateDueDate();
        this.calculateDueDay();
      },
      deep: true,
    },
    "invoice.dueDay": {
      handler(newValue) {
        this.calculateDueDate();
      },
      deep: true,
    },
    "invoice.dueDate": {
      handler(newValue) {
        this.calculateDueDay();
      },
      deep: true,
    },
  },
  computed: {
    filteredData() {
      if (this.keyword.trim() === "") {
        return this.mInvoice.data;
      }

      const filtered = this.mInvoice.data.filter((item) => {
        if (item && item.inv_number) {
          return item.inv_number.toLowerCase().includes(this.keyword.toLowerCase());
        }
        return false;
      });

      if (filtered.length === 0) {
        this.getAlert("warning", "Not Found!", "Data tidak ditemukan pada halaman ini atau keyword salah.", "main");
      }

      return filtered;
    },
  },
  mounted() {},
  data() {
    return {
      title: "A/P GENERAL",
      user: JSON.parse(localStorage.getItem("user")),
      modal: {
        cancel: false,
        action: 1,
        invoiceId: null,
        invoice: false,
        barang: false,
        detail: false,
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
      invDetail: [],
      po: {
        data: [],
        selectedPO: [],
        isLoading: false,
      },
      rn: {
        data: [],
        selectedRN: null,
        isLoading: false,
      },
      vendorAccounts: {
        data: [],
        selectedVendorAccounts: null,
        isLoading: false,
      },
      mInvoice: [],
      ppnAccounts: [],
      invoice: {
        dueDay: 0,
        pphNumber: null,
        ppnNumber: null,
        perPPN: 11,
        perPPH: 2,
        status: 1,
        type: "2",
        number: null,
        typePPN: "2",
        typePPH: "2",
        dateReceipt: null,
        docDate: null,
        dueDate: null,
        amountItems: 0,
        ppnAmount: 0,
        pphAmount: 0,
        amountTotal: 0,
        note: null,
        reference: null,
        pphAccount: null,
      },
      alert: {
        visibleOnModal: false,
        visibleOnMain: false,
        title: null,
        message: null,
        color: "danger",
      },
      filter: {
        perPage: "50",
        status: "4",
        dateStart: null,
        dateEnd: null,
      },
      keyword: "",
      countInput: 1,
      formItems: [{ no: 1, description: null, qty: 0, amount: 0, subTotal: 0 }],
    };
  },
  methods: {
    calculateDueDate() {
      if (this.invoice.dateReceipt && this.invoice.dueDay !== null) {
        const dateReceipt = new Date(this.invoice.dateReceipt);
        const dueDay = parseInt(this.invoice.dueDay);

        if (!isNaN(dateReceipt) && !isNaN(dueDay)) {
          const dueDate = new Date(dateReceipt);
          dueDate.setDate(dateReceipt.getDate() + dueDay);
          this.invoice.dueDate = dueDate.toISOString().slice(0, 10);
        }
      }
    },

    calculateDueDay() {
      if (this.invoice.dateReceipt && this.invoice.dueDate) {
        const dateReceipt = new Date(this.invoice.dateReceipt);
        const dueDate = new Date(this.invoice.dueDate);
        const timeDiff = dueDate.getTime() - dateReceipt.getTime();
        const dueDay = Math.round(timeDiff / (1000 * 3600 * 24));
        this.invoice.dueDay = dueDay;
      }
    },
    formatRef(data) {
      let res = "Unknown";
      if (data == 1) {
        res = "Payment Order";
      } else if (data == 2) {
        res = "Nota Terima Barang";
      }
      return res;
    },
    formatPPN(data) {
      let res = "Unknown";
      if (data == 1) {
        res = "Dengan PPN";
      } else if (data == 2) {
        res = "Tanpa PPN";
      }
      return res;
    },
    formatPPH(data) {
      let res = "Unknown";
      if (data == 1) {
        res = "Dengan PPH";
      } else if (data == 2) {
        res = "Tanpa PPH";
      }
      return res;
    },
    formatAmount(number) {
      return numeral(number).format("0,0.00");
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
    formatType(status) {
      const statusMap = {
        1: "Purchase Order",
        2: "Nota Terima Barang",
        3: "Lainya",
      };
      return statusMap[status] || "Unknown";
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
        const response = await ApiService.getInvoice(this.filter, page);
        this.mInvoice = response.data;
        this.getAlert("success", "Success!", `Success with ${this.mInvoice.total} data.`, "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async searchVendorAccounts(keyword) {
      try {
        this.vendorAccounts.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.vendorAccounts.isLoading = true;
        const response = await ApiService.searchVendorAccounts(keyword, signal);
        this.vendorAccounts.data = response.data.map((account) => ({
          acc_desc: account.acc_desc,
          acccode: account.acccode,
          accdesc: account.accdesc,
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.vendorAccounts.isLoading = false;
      }
    },
    async searchVendorsGeneral(keyword) {
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
          vend_account: vendor.account,
          vend_account_desc: vendor.vendor_accounts?.accdesc,
        }));
        this.vendorAccounts.data = response.data
          .filter((vendor) => vendor.account !== null && vendor.vendor_accounts.accdesc !== null)
          .map((vendor) => ({
            acccode: vendor.account,
            accdesc: vendor.vendor_accounts.accdesc,
            acc_desc: `${vendor.account} | ${vendor.vendor_accounts.accdesc}`,
          }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.vendors.isLoading = false;
      }
    },
    setAccountVendor() {
      if (Array.isArray(this.vendors.selectedVendor)) {
        this.vendorAccounts.data = this.vendors.selectedVendor.map((vendor) => ({
          acccode: vendor.vend_account,
          accdesc: vendor.vend_account_desc,
          acc_desc: `${vendor.vend_account} | ${vendor.vend_account_desc}`,
        }));
      } else if (this.vendors.selectedVendor.vend_account && this.vendors.selectedVendor.vend_account_desc) {
        this.vendorAccounts.data = [
          {
            acccode: this.vendors.selectedVendor.vend_account,
            accdesc: this.vendors.selectedVendor.vend_account_desc,
            acc_desc: `${this.vendors.selectedVendor.vend_account} | ${this.vendors.selectedVendor.vend_account_desc}`,
          },
        ];
        this.vendorAccounts.selectedVendorAccounts = {
          acccode: this.vendors.selectedVendor.vend_account,
          accdesc: this.vendors.selectedVendor.vend_account_desc,
          acc_desc: `${this.vendors.selectedVendor.vend_account} | ${this.vendors.selectedVendor.vend_account_desc}`,
        };
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
          vend_code: vendor.id,
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
    async getDetail(id) {
      try {
        this.$root.loader = true;
        const response = await ApiService.getInvoiceDetail(id);
        this.invDetail = response.data;
        this.invDetail.inv_description = JSON.parse(atob(this.invDetail.inv_description));
        this.modal.detail = true;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async searchRN(keyword) {
      try {
        this.rn.data = [];
        if (this.abortController) {
          this.abortController.abort();
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this.rn.isLoading = true;
        const response = await ApiService.searchRN(this.vendors.selectedVendor.vend_code, keyword, signal);
        this.rn.data = response.data.map((rn) => ({
          rn_id: rn.id,
          rn_number: rn.rn_number,
          rn_description: JSON.parse(atob(rn.rn_description)),
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.rn.isLoading = false;
      }
    },
    async getEdit(id) {
      try {
        this.$root.loader = true;

        const [invoiceResponse, ppnResponse] = await Promise.all([ApiService.getInvoiceDetail(id), ApiService.getPPNAccounts()]);

        this.ppnAccounts = ppnResponse.data;

        const invoiceData = invoiceResponse.data;

        this.vendors.selectedVendor = {
          id_vendname: `${invoiceData.vendors.vend_code} | ${invoiceData.vendors.vend_name}`,
          vend_code: invoiceData.vendors.vend_code,
          vend_account: invoiceData.vendors.account,
          vend_account_desc: invoiceData.vendor_accounts.accdesc,
        };

        this.invoice = {
          ppnNumber: invoiceData.ppn_number,
          pphNumber: invoiceData.pph_number,
          type: String(invoiceData.inv_type),
          number: invoiceData.inv_number,
          status: invoiceData.inv_status,
          dateReceipt: this.formatDateOther(invoiceData.inv_receipt_date),
          docDate: this.formatDateOther(invoiceData.inv_doc_date),
          dueDate: this.formatDateOther(invoiceData.inv_due_date),
          typePPN: String(invoiceData.ppn_type),
          ppnAmount: invoiceData.ppn_amount,
          typePPH: String(invoiceData.pph_type),
          pphAmount: invoiceData.pph_amount,
          pphAccount: invoiceData.pph_account,
          amountItems: invoiceData.dpp_amount,
          amountTotal: invoiceData.inv_amount,
          note: invoiceData.inv_note,
          reference: invoiceData.ref_number,
          perPPN: parseInt(this.ppnAccounts[0]?.taxvalue),
          perPPH: 2,
        };

        if (this.invoice.type == 1) {
          this.po.selectedPO = {
            po_no: invoiceData.po_number,
          };
        } else {
          this.rn.selectedRN = {
            rn_id: invoiceData.rn_id,
            rn_number: invoiceData.rn_number,
            rn_description: invoiceData.inv_description,
          };
        }

        this.vendorAccounts.selectedVendorAccounts = {
          acccode: this.vendors.selectedVendor.vend_account,
          accdesc: this.vendors.selectedVendor.vend_account_desc,
          acc_desc: `${this.vendors.selectedVendor.vend_account} | ${this.vendors.selectedVendor.vend_account_desc}`,
        };

        this.formItems = JSON.parse(atob(invoiceData.inv_description));

        this.modal = {
          action: 2,
          invoiceId: id,
          invoice: true,
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    async saveInvoice() {
      try {
        this.$root.loader = true;
        let ppnAccount = null;
        if (this.invoice.typePPN == 1) {
          ppnAccount = this.ppnAccounts[0].liablyacccode;
        } else if (this.invoice.typePPN == 2) {
          ppnAccount = this.ppnAccounts[1].liablyacccode;
        }
        const data = {
          vend_code: this.vendors.selectedVendor.vend_code,
          inv_type: this.invoice.type,
          po_number: this.invoice.type == 1 ? this.po.selectedPO.po_no : null,
          rn_id: this.invoice.type == 2 ? this.rn.selectedRN.rn_id : null,
          rn_number: this.invoice.type == 2 ? this.rn.selectedRN.rn_number : null,
          ref_number: this.invoice.reference,
          inv_number: this.invoice.number,
          inv_status: this.invoice.status,
          inv_receipt_date: this.invoice.dateReceipt,
          inv_doc_date: this.invoice.docDate,
          inv_due_date: this.invoice.dueDate,
          ppn_type: this.invoice.typePPN,
          ppn_number: this.invoice.ppnNumber,
          ppn_amount: this.invoice.ppnAmount,
          ppn_account: ppnAccount,
          pph_type: this.invoice.typePPH,
          pph_number: this.invoice.pphNumber,
          pph_amount: this.invoice.pphAmount,
          pph_account: this.invoice.typePPH == 1 ? this.invoice.pphAccount.acccode : null,
          dpp_amount: this.invoice.amountItems,
          dpp_account: this.vendorAccounts.selectedVendorAccounts.acccode,
          inv_amount: this.invoice.amountTotal,
          inv_not_payed: this.invoice.amountTotal,
          inv_note: this.invoice.note,
          inv_description: btoa(JSON.stringify(this.formItems)),
          user_id: this.user.id,
        };

        if (this.modal.action == 1) {
          const response = await ApiService.saveInvoice(data);
        } else if (this.modal.action == 2) {
          const response = await ApiService.editInvoice(data, this.modal.invoiceId);
        }
        this.setDefault();
        this.getData();
        this.getAlert("success", "Success", "Berhasil menyimpan invoice.", "main");
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat menyimpan invoice.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.confirmFirst = false;
        this.modal.confirmSecond = false;
      }
    },
    async cancelInv() {
      try {
        this.$root.loader = true;
        const response = await ApiService.cancelInv(this.modal.invoiceId);
        this.getData();
      } catch (error) {
        console.error("Error fetching data:", error);
        this.getAlert("danger", "Error", "Terjadi kesalahan saat membatalkan invoice.", "main");
      } finally {
        this.$root.loader = false;
        this.modal.cancel = false;
      }
    },
    validInvoice() {
      this.alert.visibleOnModal = false;
      const isFieldEmpty = (field) => field === undefined || field === null || field === "";

      const emptyFields = [];

      if (isFieldEmpty(this.vendors.selectedVendor)) {
        emptyFields.push("Kode Vendor");
      }
      if (isFieldEmpty(this.invoice.number)) {
        emptyFields.push("Nomor Invoice");
      }
      if (isFieldEmpty(this.invoice.status)) {
        emptyFields.push("Status Invoice");
      }
      if (isFieldEmpty(this.invoice.dateReceipt)) {
        emptyFields.push("Tanggal Penerimaan");
      }
      if (isFieldEmpty(this.invoice.docDate)) {
        emptyFields.push("Tanggal Dokumen");
      }
      if (isFieldEmpty(this.invoice.dueDate)) {
        emptyFields.push("Tanggal Jatuh Tempo");
      }
      if (isFieldEmpty(this.invoice.amountItems)) {
        emptyFields.push("Jumlah Item");
      }
      if (isFieldEmpty(this.vendorAccounts.selectedVendorAccounts)) {
        emptyFields.push("Kode Akun Vendor");
      }
      if (isFieldEmpty(this.invoice.amountTotal)) {
        emptyFields.push("Jumlah Total");
      }
      this.formItems.forEach((item, index) => {
        if (isFieldEmpty(item.description)) {
          emptyFields.push(`Deskripsi Item ${index + 1}`);
        }
      });

      if (emptyFields.length > 0) {
        this.getAlert("danger", "Error", `Kolom berikut harus diisi: ${emptyFields.join(", ")}`, "modal");
      } else {
        this.modal.confirmFirst = true;
        this.modal.invoice = false;
      }
    },
    setData() {
      try {
        if (Array.isArray(this.rn.selectedRN.rn_description)) {
          this.formItems = this.rn.selectedRN.rn_description.map((item) => ({
            no: item.no || 0,
            description: item.description || null,
            qty: item.qty || 0,
            amount: item.amount || 0,
            subTotal: item.subTotal || 0,
          }));
        }
      } catch (error) {
        this.getAlert("danger", "Error", "Terjadi error.", "modal");
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
        }));
      } catch (error) {
        if (error.message !== "canceled") {
          console.error("Error fetching data:", error);
        }
      } finally {
        this.po.isLoading = false;
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
    async openModalNewInvoice() {
      try {
        this.$root.loader = true;
        const response = await ApiService.getPPNAccounts();
        this.ppnAccounts = response.data;
        this.invoice.perPPN = parseInt(this.ppnAccounts[0]?.taxvalue);
        this.modal.invoice = true;
        this.modal.action = 1;
      } catch (error) {
        this.getAlert("danger", "Error", "Terjadi error saat mengambil data.", "main");
      } finally {
        this.$root.loader = false;
      }
    },
    updateSubTotals() {
      this.formItems.forEach((item) => {
        item.subTotal = item.qty * item.amount;
      });
    },
    updateTotalAmountItems() {
      this.invoice.amountItems = this.formItems.reduce((total, item) => {
        return total + item.subTotal;
      }, 0);
      var aPPN = this.invoice.perPPN / 100;
      var aPPH = this.invoice.perPPH / 100;
      if (this.invoice.typePPN == 1) {
        this.invoice.ppnAmount = Math.round(this.invoice.amountItems * aPPN);
      } else {
        this.invoice.ppnAmount = 0;
      }
      if (this.invoice.typePPH == 1) {
        this.invoice.pphAmount = Math.round(this.invoice.amountItems * aPPH);
      } else {
        this.invoice.pphAmount = 0;
      }
    },
    setDefault() {
      this.vendors = {
        data: [],
        selectedVendor: null,
        isLoading: false,
      };
      this.po = {
        data: [],
        selectedPO: [],
        isLoading: false,
      };
      this.rn = {
        data: [],
        selectedRN: null,
        isLoading: false,
      };
      this.vendorAccounts = {
        data: [],
        selectedVendorAccounts: null,
        isLoading: false,
      };
      this.ppnAccounts = [];
      this.invoice = {
        ppnNumber: null,
        pphNumber: null,
        perPPN: 11,
        perPPH: 2,
        status: 1,
        type: "2",
        number: null,
        typePPN: "2",
        typePPH: "2",
        dateReceipt: null,
        docDate: null,
        dueDate: null,
        amountItems: 0,
        ppnAmount: 0,
        pphAmount: 0,
        amountTotal: 0,
        note: null,
        reference: null,
        pphAccount: [],
      };
      this.countInput = 1;
      this.formItems = [{ no: 1, description: null, qty: 0, amount: 0, subTotal: 0 }];
      this.delivery = {
        data: [],
        selectedDelivery: [],
        isLoading: false,
      };
      this.countInput = 1;
      this.formItems = [{ no: 1, description: null, qty: 0, amount: 0, note: null }];
    },
    updateTotalAmount() {
      this.invoice.amountTotal = parseInt(this.invoice.amountItems) - parseInt(this.invoice.pphAmount) + parseInt(this.invoice.ppnAmount);
    },
    saveAsDraft() {
      this.invoice.status = 1;
      this.saveInvoice();
    },
    openCancelInv(id) {
      this.modal.invoiceId = id;
      this.modal.cancel = true;
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
      const startPage = Math.max(1, this.mInvoice.current_page - 4);
      const endPage = Math.min(startPage + 8, this.mInvoice.last_page);

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
