package com.passwordlessauth.banking.dto;

public class TransferResponse {
    private String transferId;
    private String status;

    public TransferResponse() {}
    public TransferResponse(String transferId, String status) { this.transferId = transferId; this.status = status; }

    public String getTransferId() { return transferId; }
    public void setTransferId(String transferId) { this.transferId = transferId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
