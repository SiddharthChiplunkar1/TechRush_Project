import { api } from "@/lib/api";

const unwrap = (response) => response.data?.data ?? response.data;

const bankingService = {
  getBeneficiaries: () => api.get("/api/banking/beneficiaries").then(unwrap),
  initiateTransfer: (payload) => api.post("/api/banking/transfer", payload).then(unwrap),
  confirmTransfer: (payload) => api.post("/api/banking/transfer/confirm", payload).then(unwrap),
  verifyStepUpChallenge: (challengeId) =>
    api.post(`/api/banking/step-up/challenges/${challengeId}/verify`).then(unwrap),
  getTransactions: (params = {}) => api.get("/api/banking/transactions", { params }).then(unwrap)
};

export {
  bankingService
};
