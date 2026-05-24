import os

tabs = [
  'InventoryTab.tsx',
  'PurchasesTab.tsx',
  'InvoicingTab.tsx',
  'ReportsTab.tsx',
  'ReportsViewTab.tsx',
  'RolesTab.tsx',
  'PersonalTab.tsx',
  'ConfigTab.tsx',
  'UsersTab.tsx',
  'SuperAdminTab.tsx',
  'StaffLogin.tsx',
  'Login.tsx',
  'SettingsModal.tsx'
]

dir_path = r'e:\VISUAL STUDIO CODE\MEKA TALLER\src\components'

replacements = {
  'bg-white': 'bg-[var(--modal-bg)]',
  'border-zinc-100': 'border-[var(--border-main)]',
  'border-zinc-200': 'border-[var(--border-main)]',
  'border-zinc-300': 'border-[var(--border-main)]',
  'text-zinc-900': 'text-[var(--text-main)]',
  'text-zinc-800': 'text-[var(--text-main)]',
  'text-zinc-500': 'text-[var(--text-muted)]',
  'text-zinc-400': 'text-[var(--text-muted)]',
  'text-gray-500': 'text-[var(--text-muted)]',
  'text-gray-400': 'text-[var(--text-muted)]',
  'text-slate-800': 'text-[var(--text-main)]',
  'text-slate-500': 'text-[var(--text-muted)]',
  'hover:bg-zinc-50': 'hover:bg-[var(--table-row-hover)]',
  'hover:bg-zinc-100': 'hover:bg-[var(--table-row-hover)]',
  'bg-zinc-100': 'bg-[var(--table-header-bg)]',
  'bg-zinc-50': 'bg-[var(--table-header-bg)]',
  'divide-zinc-200': 'divide-[var(--table-divider)]',
  'divide-zinc-100': 'divide-[var(--table-divider)]',
  'border-slate-200': 'border-[var(--input-border)]',
  'border-gray-100': 'border-[var(--border-main)]',
  'border-gray-200': 'border-[var(--border-main)]',
  'divide-slate-200': 'divide-[var(--table-divider)]'
}

for tab in tabs:
    filepath = os.path.join(dir_path, tab)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("done")
