const fs = require('fs');
const path = require('path');

const tabs = [
  'MaintenanceTab.tsx',
  'InventoryTab.tsx',
  'PurchasesTab.tsx',
  'InvoicingTab.tsx',
  'ReportsTab.tsx',
  'ReportsViewTab.tsx',
  'RolesTab.tsx',
  'PersonalTab.tsx',
  'ConfigTab.tsx',
  'UsersTab.tsx',
  'SuperAdminTab.tsx'
];

const dir = path.join(__dirname, 'src', 'components');

const replacements = [
  [/\bbg-white\b/g, 'bg-[var(--modal-bg)]'],
  [/\bborder-zinc-100\b/g, 'border-[var(--border-main)]'],
  [/\bborder-zinc-200\b/g, 'border-[var(--border-main)]'],
  [/\bborder-zinc-300\b/g, 'border-[var(--border-main)]'],
  [/\btext-zinc-900\b/g, 'text-[var(--text-main)]'],
  [/\btext-zinc-800\b/g, 'text-[var(--text-main)]'],
  [/\btext-zinc-500\b/g, 'text-[var(--text-muted)]'],
  [/\btext-zinc-400\b/g, 'text-[var(--text-muted)]'],
  [/\btext-gray-500\b/g, 'text-[var(--text-muted)]'],
  [/\btext-gray-400\b/g, 'text-[var(--text-muted)]'],
  [/\btext-slate-800\b/g, 'text-[var(--text-main)]'],
  [/\btext-slate-500\b/g, 'text-[var(--text-muted)]'],
  [/\bhover:bg-zinc-50\b/g, 'hover:bg-[var(--table-row-hover)]'],
  [/\bhover:bg-zinc-100\b/g, 'hover:bg-[var(--table-row-hover)]'],
  [/\bbg-zinc-100\b/g, 'bg-[var(--table-header-bg)]'],
  [/\bbg-zinc-50\b/g, 'bg-[var(--table-header-bg)]'],
  [/\bdivide-zinc-200\b/g, 'divide-[var(--table-divider)]'],
  [/\bdivide-zinc-100\b/g, 'divide-[var(--table-divider)]'],
  [/\bborder-slate-200\b/g, 'border-[var(--input-border)]'],
  [/\bborder-gray-100\b/g, 'border-[var(--border-main)]'],
  [/\bborder-gray-200\b/g, 'border-[var(--border-main)]'],
  [/\bdivide-slate-200\b/g, 'divide-[var(--table-divider)]']
];

tabs.forEach(tab => {
  const filepath = path.join(dir, tab);
  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');

  replacements.forEach(([regex, repl]) => {
    content = content.replace(regex, repl);
  });

  fs.writeFileSync(filepath, content);
  console.log(`Updated ${tab}`);
});
console.log('done');
