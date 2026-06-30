Reset Samuel's password (temporary)

1) Ensure you have the project env vars available (service role key). Example in PowerShell:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
node scripts/reset-samuel-password.mjs samuel@example.com "TempP@ssw0rd123!"
```

Or using a UID directly:

```powershell
node scripts/reset-samuel-password.mjs 123e4567-e89b-12d3-a456-426614174000 "TempP@ssw0rd123!"
```

2) After running, inform Samuel and require an immediate password change.

Notes:
- This script requires `@supabase/supabase-js` to be installed in the project. If missing, run:

```powershell
pnpm add @supabase/supabase-js
```

- Keep the service role key secret and run this script only on a trusted machine.
