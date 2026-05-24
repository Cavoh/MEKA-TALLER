$tabs = @(
  "InventoryTab.tsx", "PurchasesTab.tsx", "InvoicingTab.tsx", "ReportsTab.tsx",
  "ReportsViewTab.tsx", "RolesTab.tsx", "PersonalTab.tsx", "ConfigTab.tsx",
  "UsersTab.tsx", "SuperAdminTab.tsx", "StaffLogin.tsx", "Login.tsx", "SettingsModal.tsx"
)

$dir = "e:\VISUAL STUDIO CODE\MEKA TALLER\src\components"

$replacements = @{
  "bg-white" = "bg-[var(--modal-bg)]"
  "border-zinc-100" = "border-[var(--border-main)]"
  "border-zinc-200" = "border-[var(--border-main)]"
  "border-zinc-300" = "border-[var(--border-main)]"
  "text-zinc-900" = "text-[var(--text-main)]"
  "text-zinc-800" = "text-[var(--text-main)]"
  "text-zinc-500" = "text-[var(--text-muted)]"
  "text-zinc-400" = "text-[var(--text-muted)]"
  "text-gray-500" = "text-[var(--text-muted)]"
  "text-gray-400" = "text-[var(--text-muted)]"
  "text-slate-800" = "text-[var(--text-main)]"
  "text-slate-500" = "text-[var(--text-muted)]"
  "hover:bg-zinc-50" = "hover:bg-[var(--table-row-hover)]"
  "hover:bg-zinc-100" = "hover:bg-[var(--table-row-hover)]"
  "bg-zinc-100" = "bg-[var(--table-header-bg)]"
  "bg-zinc-50" = "bg-[var(--table-header-bg)]"
  "divide-zinc-200" = "divide-[var(--table-divider)]"
  "divide-zinc-100" = "divide-[var(--table-divider)]"
  "border-slate-200" = "border-[var(--input-border)]"
  "border-gray-100" = "border-[var(--border-main)]"
  "border-gray-200" = "border-[var(--border-main)]"
  "divide-slate-200" = "divide-[var(--table-divider)]"
}

foreach ($tab in $tabs) {
  $path = Join-Path $dir $tab
  if (Test-Path $path) {
    $content = Get-Content $path -Raw
    foreach ($key in $replacements.Keys) {
        $content = $content.Replace($key, $replacements[$key])
    }
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Updated $tab"
  }
}
Write-Host "done"
