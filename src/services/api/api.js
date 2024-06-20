import axios from "axios";

const api = axios.create({
  baseURL: process.env.APP_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  async login(data) {
    try {
      const response = await api.post(`login`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  },
  async logout() {
    try {
      const response = await api.post(`logout`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  },
  async searchVendors(keyword, signal) {
    try {
      const response = await api.get(`vendors-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchUsers(keyword, signal) {
    try {
      const response = await api.get(`user-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchInvoice(keyword, code, signal) {
    try {
      const response = await api.get(`inv-search`, {
        params: { keyword, code },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchBank(keyword, signal) {
    try {
      const response = await api.get(`bank-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async allBank() {
    try {
      const response = await api.get(`bank-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchVendorsGeneral(keyword, signal) {
    try {
      const response = await api.get(`vendors-general-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchVendorAccounts(keyword, signal) {
    try {
      const response = await api.get(`vendor-accounts-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchPO(keyword, signal) {
    try {
      const response = await api.get(`po-search`, {
        params: { keyword },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchRN(code, keyword, signal) {
    try {
      const response = await api.get(`rn-search`, {
        params: { keyword, code },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async searchDO(code, dep, keyword, signal) {
    try {
      const response = await api.get(`do-search`, {
        params: { keyword, code, dep },
        signal,
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async getType() {
    try {
      const response = await api.get(`rnt-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      if (error.message === "canceled") {
        return { data: [] };
      }
      throw new Error("API Error: " + error.message);
    }
  },
  async getPPNAccounts() {
    try {
      const response = await api.get(`tax-accounts-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getApproval(filter, page) {
    try {
      const response = await api.get(`apvh-get`, {
        timeout: 20000,
        params: {
          page: page,
          perPage: filter.perPage,
          status: filter.status,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async setStatusApv(id, status) {
    try {
      const response = await api.get(`apvh-status/${id}`, {
        params: {
          status: status,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getapvDetail(id) {
    try {
      const response = await api.get(`apvh-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getAging() {
    try {
      const response = await api.get(`aging-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getAgingPayment() {
    try {
      const response = await api.get(`aging-pv-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getInvoices(id) {
    try {
      const response = await api.get(`aging-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPayments(id) {
    try {
      const response = await api.get(`aging-pv-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveDO(data) {
    try {
      const response = await api.post(`do-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveApv(data) {
    try {
      const response = await api.post(`apvh-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async savePV(data) {
    try {
      const response = await api.post(`pv-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveNTB(data) {
    try {
      const response = await api.post(`rn-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async cancelNTB(id) {
    try {
      const response = await api.get(`rn-cancel/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveInvoice(data) {
    try {
      const response = await api.post(`inv-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async editPV(data, id) {
    try {
      const response = await api.put(`pv-save/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async editInvoice(data, id) {
    try {
      const response = await api.put(`inv-save/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async cancelDO(id) {
    try {
      const response = await api.get(`do-cancel/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async cancelInv(id) {
    try {
      const response = await api.get(`inv-cancel/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async setStatusUser(id) {
    try {
      const response = await api.get(`user-status/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getDO(filter, dept, page) {
    try {
      const response = await api.get(`do-get`, {
        params: {
          page: page,
          dept: dept,
          perPage: filter.perPage,
          cutOffDoc: filter.cutOffDoc,
          cutOffDue: filter.cutOffDue,
          status: filter.status,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPV(filter, page) {
    try {
      const response = await api.get(`pv-get`, {
        params: {
          page: page,
          perPage: filter.perPage,
          cutOffDoc: filter.cutOffDoc,
          cutOffDue: filter.cutOffDue,
          status: filter.status,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPVR(filter, page) {
    try {
      const response = await api.get(`pvr-get`, {
        params: {
          page: page,
          perPage: filter.perPage,
          cutOffDoc: filter.cutOffDoc,
          cutOffDue: filter.cutOffDue,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getInvoice(filter, page) {
    try {
      const response = await api.get(`inv-get`, {
        params: {
          page: page,
          perPage: filter.perPage,
          cutOffDoc: filter.cutOffDoc,
          cutOffDue: filter.cutOffDue,
          status: filter.status,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getNTB(filter, dept, page) {
    try {
      const response = await api.get(`rn-get`, {
        params: {
          page: page,
          dept: dept,
          perPage: filter.perPage,
          cutOffDoc: filter.cutOffDoc,
          cutOffDue: filter.cutOffDue,
          status: filter.status,
        },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getDODetail(id) {
    try {
      const response = await api.get(`do-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getUser() {
    try {
      const response = await api.get(`user-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getRoleUser(id) {
    try {
      const response = await api.get(`ru-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPVDetail(id) {
    try {
      const response = await api.get(`pv-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getInvoiceDetail(id) {
    try {
      const response = await api.get(`inv-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getRNForApprove(page, id, filter) {
    try {
      const response = await api.get(`rn-get-apv/${id}`, {
        params: { page, status: filter.status, perPage: filter.perPage, department: filter.department },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPVForApprove(page, id, filter) {
    try {
      const response = await api.get(`pv-get-apv/${id}`, {
        params: { page, status: filter.status, perPage: filter.perPage },
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getRNDetail(id) {
    try {
      const response = await api.get(`rn-get/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveApproval(id, data) {
    try {
      const response = await api.put(`rn-save-apv/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveApprovalPV(id, data) {
    try {
      const response = await api.put(`pv-save-apv/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async editNTB(data, id) {
    try {
      const response = await api.put(`rn-save/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async editDO(data, id) {
    try {
      const response = await api.put(`do-save/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async savePVR(data, id) {
    try {
      const response = await api.post(`pvr-save/${id}`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async saveUser(data) {
    try {
      const response = await api.post(`user-save`, data, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async cancelPVR(userId, id) {
    try {
      const response = await api.post(`pvr-cancel/${id}`, userId, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getRNDocx(id) {
    try {
      const response = await api.get(`rn-docx/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getDep() {
    try {
      const response = await api.get(`dep-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getRole() {
    try {
      const response = await api.get(`role-get`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
  async getPVDocx(id) {
    try {
      const response = await api.get(`pv-docx/${id}`, {
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      throw new Error("API Error: " + error.message);
    }
  },
};
