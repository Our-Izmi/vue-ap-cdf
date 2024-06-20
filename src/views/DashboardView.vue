<template>
  <Pages title="Dashboard">
    <CCard class="mb-3">
      <CCardHeader class="d-flex justify-content-between align-items-center">
        <div>Monitoring {{ !month ? "This Month" : month }}</div>
        <div>
          <CDropdown>
            <CDropdownToggle color="primary">
              <CIcon icon="cil-calendar" width="24" height="24" />
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem @click="countData('01', 'January')">January</CDropdownItem>
              <CDropdownItem @click="countData('02', 'February')">February</CDropdownItem>
              <CDropdownItem @click="countData('03', 'March')">March</CDropdownItem>
              <CDropdownItem @click="countData('04', 'April')">April</CDropdownItem>
              <CDropdownItem @click="countData('05', 'May')">May</CDropdownItem>
              <CDropdownItem @click="countData('06', 'June')">June</CDropdownItem>
              <CDropdownItem @click="countData('07', 'July')">July</CDropdownItem>
              <CDropdownItem @click="countData('08', 'August')">August</CDropdownItem>
              <CDropdownItem @click="countData('09', 'September')">September</CDropdownItem>
              <CDropdownItem @click="countData('10', 'October')">October</CDropdownItem>
              <CDropdownItem @click="countData('11', 'November')">November</CDropdownItem>
              <CDropdownItem @click="countData('12', 'December')">December</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
      </CCardHeader>

      <CCardBody>
        <CAlert
          class="d-flex align-items-center"
          :color="alert.color"
          :visible="alert.visible"
          dismissible
          @close="
            () => {
              alert.visible = false;
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
          <CCol :sm="6">
            <div>
              <canvas id="agingVendorChart"></canvas>
            </div>
          </CCol>
          <CCol :sm="6">
            <div>
              <canvas id="agingMonthChart"></canvas>
            </div>
          </CCol>
        </CRow>
        <CRow class="mb-3">
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="REQUISITIONS" :value="this.count.requisitions ? this.count.requisitions : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="info" title="REQUISITIONS NON PO COUNT" :value="this.count.requisitionsNonPO ? this.count.requisitionsNonPO : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="secondary" title="DOWN PAYMENTS COUNT" :value="this.count.downPayments ? this.count.downPayments : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
        </CRow>
        <CRow class="mb-3">
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="REQUISITIONS COUNT" :value="this.count.requisitionsAmount ? this.count.requisitionsAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="info" title="REQUISITIONS NON PO AMOUNT" :value="this.count.requisitionsNonPOAmount ? this.count.requisitionsNonPOAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="secondary" title="DOWN PAYMENTS AMOUNT" :value="this.count.downPaymentsAmount ? this.count.downPaymentsAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-file" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
        </CRow>
        <CRow class="mb-3">
          <CCol :sm="4">
            <CWidgetStatsF color="warning" title="PAYMENT ORDERS COUNT AMOUNT" :value="this.count.paymentOrders ? this.count.paymentOrders : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-basket" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="INVOICES COUNT" :value="this.count.invoices ? this.count.invoices : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-money" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="PAYMENT VOUCHERS COUNT" :value="this.count.paymentVouchers ? this.count.paymentVouchers : '0'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-description" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
        </CRow>
        <CRow class="mb-3">
          <CCol :sm="4">
            <CWidgetStatsF color="warning" title="PAYMENT ORDERS AMOUNT" :value="this.count.paymentOrdersAmount ? this.count.paymentOrdersAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-basket" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="INVOICES AMOUNT" :value="this.count.invoicesAmount ? this.count.invoicesAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-money" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="PAYMENT VOUCHERS AMOUNT" :value="this.count.paymentVouchersAmount ? this.count.paymentVouchersAmount : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-description" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardHeader>Aging</CCardHeader>
      <CCardBody>
        <CRow>
          <CCol :sm="4">
            <CWidgetStatsF color="primary" title="Total" :value="count.totalBill ? count.totalBill : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-money" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="warning" :title="!month ? 'THIS MONTH' : month" :value="count.totalBillMonth ? count.totalBillMonth : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-money" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
          <CCol :sm="4">
            <CWidgetStatsF color="danger" title="Over Due" :value="count.totalBillOver ? count.totalBillOver : 'Rp.0,00'">
              <template #icon>
                <CIcon v-if="!spinner" icon="cil-money" width="24" height="24" />
                <CSpinner v-if="spinner" variant="grow" />
              </template>
            </CWidgetStatsF>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  </Pages>
</template>

<script>
import Pages from "@/components/template/Pages.vue";
import ApiService from "@/services/api/api.js";
import Chart from "chart.js/auto";

export default {
  components: {
    Pages,
  },
  mounted() {},
  data() {
    return {
      count: {
        requisitions: null,
        requisitionsNonPO: null,
        downPayments: null,
        paymentOrders: null,
        invoices: null,
        paymentVouchers: null,
        requisitionsAmount: null,
        requisitionsNonPOAmount: null,
        downPaymentsAmount: null,
        paymentOrdersAmount: null,
        invoicesAmount: null,
        paymentVouchersAmount: null,
        totalBill: null,
        totalBillMonth: null,
        totalPaidMonth: null,
        totalNotPaidMonth: null,
        totalBillOver: null,
        vendors: null,
      },
      myChart: {
        agingMonth: null,
        agingVendor: null,
      },
      spinner: false,
      alert: {
        visible: false,
        title: null,
        message: null,
        color: "danger",
      },
      month: null,
    };
  },
  methods: {
    agingMonthChart() {
      const hutangDibayar = this.count.totalPaidMonth;
      const hutangBelumDibayar = this.count.totalNotPaidMonth;

      const chartData = {
        labels: ["Hutang yang Telah Dibayar", "Hutang yang Belum Dibayar"],
        datasets: [
          {
            label: "Hutang",
            backgroundColor: ["#36A2EB", "#FF6384"],
            data: [hutangDibayar, hutangBelumDibayar],
          },
        ],
      };
      const ctx = document.getElementById("agingMonthChart").getContext("2d");
      if (this.myChart.agingMonth) {
        this.myChart.agingMonth.destroy();
      }
      this.myChart.agingMonth = new Chart(ctx, {
        type: "pie",
        data: chartData,
      });
    },
    agingVendorChart(vendorData) {
      const chartData = {
        labels: [],
        datasets: [
          {
            label: "Hutang per Vendor",
            backgroundColor: [],
            data: [],
          },
        ],
      };
      for (let i = 0; i < vendorData.length; i++) {
        chartData.labels.push(vendorData[i].vendname);
        chartData.datasets[0].data.push(vendorData[i].invoices_sum_doctotalamtr);
        const dynamicColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
        chartData.datasets[0].backgroundColor.push(dynamicColor);
      }

      const ctx = document.getElementById("agingVendorChart").getContext("2d");
      if (this.myChart.agingVendor) {
        this.myChart.agingVendor.destroy();
      }
      this.myChart.agingVendor = new Chart(ctx, {
        type: "pie",
        data: chartData,
      });
    },

    renderChart() {
      const ctx = document.getElementById("lineChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Hutang",
              data: [352523647, 367845239, 384920561, 396708324, 402563982, 418943205, 427850932, 434902354, 442308765, 455098324, 462378401, 478904321],
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: false,
            },
            {
              label: "Piutang",
              data: [312453678, 327894561, 334908765, 345298765, 357891234, 365438912, 376980123, 384209876, 395674123, 402398765, 415672398, 421398765],
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value, index, values) {
                  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
                },
              },
            },
          },
        },
      });
    },
    async countData(month = "00", monthChar) {
      try {
        this.alert.visible = false;
        this.spinner = true;

        const response = await ApiService.countData(month);

        this.count.requisitions = response.requisitions.reqWithPO;
        this.count.requisitionsNonPO = response.requisitions.reqNonPO;
        this.count.downPayments = response.requisitions.downPayments;
        this.count.paymentOrders = response.paymentOrders.paymentOrderCount;
        this.count.invoices = response.invoices.invoiceCount;
        this.count.paymentVouchers = response.paymentVouchers.paymentVoucherCount;
        this.count.totalBill = response.aging.totalBill;
        this.count.totalBillMonth = response.aging.totalBillByMonth;
        this.count.totalPaidMonth = response.aging.totalPaidByMonth;
        this.count.totalNotPaidMonth = response.aging.totalNotPaidByMonth;
        this.count.vendors = response.aging.vendors;
        this.count.totalBillOver = response.aging.totalBillOverDue;
        this.count.requisitionsAmount = response.requisitions.reqWithPOAmount;
        this.count.requisitionsNonPOAmount = response.requisitions.reqNonPOAmount;
        this.count.downPaymentsAmount = response.requisitions.downPaymentsAmount;
        this.count.paymentOrdersAmount = response.paymentOrders.paymentOrderSum;
        this.count.invoicesAmount = response.invoices.invoiceSum;
        this.count.paymentVouchersAmount = response.paymentVouchers.paymentVoucherSum;
        this.month = monthChar;
        this.agingMonthChart();
        this.agingVendorChart(this.count.vendors);
        // this.renderChart();
      } catch (error) {
        this.getAlert("danger", "Error!", error.message);
        console.error("Error fetching data:", error);
      } finally {
        this.spinner = false;
      }
    },
    getAlert(color, title, message) {
      this.alert.title = title;
      this.alert.color = color;
      this.alert.message = message;
      this.alert.visible = true;

      this.scrollToTop();
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>
