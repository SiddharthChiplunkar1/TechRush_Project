# Auth Database Provisioning

Run `provision_admin.sql` only through an approved change process and against the intended Auth database.

From PowerShell, use the `psql` client inside the running database container. This avoids requiring PostgreSQL tools on the host:

```powershell
Get-Content .\database\migrations\provision_admin.sql | docker compose exec -T postgres-auth psql -U postgres -d authdb --set=ON_ERROR_STOP=1 --set=ADMIN_EMAIL=admin@techrush.dev
```

The command requires Docker Desktop to be running and accessible to the current terminal. Do not use Bash `\` line continuations in PowerShell.

The migration is transactional and idempotent. It promotes an existing account or creates a verified `ADMIN` account. It does not create a password because Auth uses OTP authentication. Use a secret-managed database connection, review the target before execution, and record the resulting admin email in the deployment change log.
