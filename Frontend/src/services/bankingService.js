import { api } from "@/lib/api";

const unwrap = (response) => response.data?.data ?? response.data;

const bankingService = {
  getBalance: () => api.get("/api/banking/balance").then(unwrap),
  getBeneficiaries: () => api.get("/api/banking/beneficiaries").then(unwrap),
  addBeneficiary: (payload) => api.post("/api/banking/beneficiaries", payload).then(unwrap),
  updateBeneficiary: (id, payload) =>
    api.put(`/api/banking/beneficiaries/${encodeURIComponent(id)}`, payload).then(unwrap),
  deleteBeneficiary: (id) => api.delete(`/api/banking/beneficiaries/${encodeURIComponent(id)}`),
  setBeneficiaryFavorite: (id, favourite) =>
    api.post(`/api/banking/beneficiaries/${encodeURIComponent(id)}/favorite`, null, {
      params: { fav: favourite },
    }),
  initiateTransfer: (payload) => api.post("/api/banking/transfer", payload).then(unwrap),
  requestTransferOtp: () => api.post("/api/banking/transfer/otp/request").then(unwrap),
  confirmTransfer: (payload) => api.post("/api/banking/transfer/confirm", payload).then(unwrap),
  verifyStepUpChallenge: (challengeId, otp) =>
    api.post(`/api/banking/step-up/challenges/${challengeId}/verify`, { otp }).then(unwrap),
  getTransactions: (params = {}) => api.get("/api/banking/transactions", { params }).then(unwrap),
};

export { bankingService };
