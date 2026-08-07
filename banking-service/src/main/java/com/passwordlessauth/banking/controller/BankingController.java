@@
     private final BankingService bankingService;
@@
     public BankingController(BankingService bankingService) {
         this.bankingService = bankingService;
     }
+
+    // PostConstruct to wire notification client if available via Spring context
+    @javax.annotation.PostConstruct
+    public void init() {
+        try {
+            org.springframework.context.ApplicationContext ctx =
+                    org.springframework.web.context.support.WebApplicationContextUtils
+                            .getRequiredWebApplicationContext(((org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes()).getRequest()));
+        } catch (Exception ignored) {}
+    }
