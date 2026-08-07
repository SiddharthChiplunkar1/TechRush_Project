package com.passwordlessauth.banking.dto;

public class ConfirmTransferRequest {
    private String transferId;
    private boolean confirm;

    public String getTransferId() { return transferId; }
    public void setTransferId(String transferId) { this.transferId = transferId; }
    public boolean isConfirm() { return confirm; }
    public void setConfirm(boolean confirm) { this.confirm = confirm; }
}
