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
  'SuperAdminTab.tsx',
  'StaffLogin.tsx',
  'Login.tsx',
  'SettingsModal.tsx',
  'AppearanceModal.tsx',
  'ClientsTab.tsx'
];

const dir = path.join('e:', 'VISUAL STUDIO CODE', 'MEKA TALLER', 'src', 'components');

const map = {
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã': 'Á',
  'Ã‰': 'É',
  'Ã': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã‘': 'Ñ',
  'Ã¼': 'ü',
  'Â¿': '¿',
  'Â¡': '¡'
};

tabs.forEach(tab => {
  const filepath = path.join(dir, tab);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Some characters might have been mangled differently due to Windows-1252. 
    // Let's do a reliable latin1 -> utf8 decode instead for the whole file
    try {
        // Read the file as latin1, which might correctly represent the bytes before PS mangled it?
        // Actually, no. PS read UTF-8 file bytes as Windows-1252, and wrote them as UTF-8 characters.
        // So the characters in the file are UTF-8 representations of Windows-1252 text.
        // If we read as UTF-8, we get strings with `Ã³`.
        // We can just use string replace for the specific known corruptions first.
        let newContent = content;
        for (const [bad, good] of Object.entries(map)) {
            newContent = newContent.split(bad).join(good);
        }
        
        // Let's handle some common weird ones that are invisible
        newContent = newContent.replace(/INFORMACIÃ\x8dN/g, 'INFORMACIÓN');
        newContent = newContent.replace(/MÃ\x93DULO/g, 'MÓDULO');
        newContent = newContent.replace(/Ã\x8dTEM/g, 'ÍTEM');
        newContent = newContent.replace(/MecÃ¢nico/g, 'Mecánico');
        
        if (newContent !== content) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log('Fixed encoding in ' + tab);
        }
    } catch(e) {
        console.error(e);
    }
  }
});
