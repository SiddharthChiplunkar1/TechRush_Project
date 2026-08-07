@@
     public BankingService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
         this.accountRepository = accountRepository;
         this.transactionRepository = transactionRepository;
     }
+
+    // inject NotificationClient via setter to avoid constructor changes in existing code flow
+    private com.passwordlessauth.banking.client.NotificationClient notificationClient;
+
+    public void setNotificationClient(com.passwordlessauth.banking.client.NotificationClient client) {
+        this.notificationClient = client;
+    }
@@
     public List<TransactionDto> getTransactionsForUser(String userId) {
@@
     }
 }
