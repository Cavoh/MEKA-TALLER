const fs = require('fs');

function replaceClasses(filepath) {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  const replacements = {
    'bg-amber-50': 'bg-[var(--table-header-bg)]',
    'border-amber-200': 'border-[var(--border-main)]',
    'text-amber-900': 'text-[var(--text-main)]',
    'focus:ring-amber-400': 'focus:ring-[var(--input-focus-border)]',
    'bg-blue-50': 'bg-[var(--table-header-bg)]',
    'border-blue-100': 'border-[var(--border-main)]',
    'text-blue-700': 'text-[var(--text-main)]',
    'bg-emerald-100': 'bg-[var(--table-row-hover)]',
    'text-emerald-700': 'text-emerald-500',
    'text-emerald-600': 'text-emerald-500',
    'text-amber-600': 'text-amber-500',
    'bg-zinc-900 text-white': 'bg-[var(--text-main)] text-[var(--modal-bg)]',
    'hover:bg-zinc-800': 'hover:bg-[var(--text-muted)]',
    'text-red-600': 'text-red-500',
    'bg-zinc-100': 'bg-[var(--input-bg)]'
  };

  let modified = content;
  for (const [key, value] of Object.entries(replacements)) {
    modified = modified.split(key).join(value);
  }

  if (modified !== content) {
    fs.writeFileSync(filepath, modified, 'utf8');
    console.log(`Updated classes in ${filepath}`);
  }
}

replaceClasses('e:\\VISUAL STUDIO CODE\\MEKA TALLER\\src\\components\\InvoicingTab.tsx');
replaceClasses('e:\\VISUAL STUDIO CODE\\MEKA TALLER\\src\\components\\PurchasesTab.tsx');
