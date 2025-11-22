const readline = require('readline');
const db = require('./db');
const fs = require('fs'); // Added for Export Feature
require('./events/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Export Data
6. Search Records
7. Sort Records
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created || 'N/A'}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? 'Record updated!' : 'Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? 'Record deleted!' : 'Record not found.');
          menu();
        });
        break;

      case '5': // === EXPORT DATA ===
        const allData = db.listRecords();
        const exportContent = `Vault Export\nDate: ${new Date().toLocaleString()}\nTotal Records: ${allData.length}\n\n` +
            allData.map(r => `ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`).join('\n');
        
        fs.writeFileSync('export.txt', exportContent);
        console.log('Data exported successfully to export.txt');
        menu();
        break;

      case '6': // === SEARCH ===
        rl.question('Enter search keyword: ', keyword => {
            const allRecords = db.listRecords();
            const lowerKeyword = keyword.toLowerCase();
            const matches = allRecords.filter(r => 
                r.name.toLowerCase().includes(lowerKeyword) || 
                String(r.id).includes(lowerKeyword)
            );
            if (matches.length === 0) console.log('No records found.');
            else {
                console.log(`Found ${matches.length} matching records:`);
                matches.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name}`));
            }
            menu();
        });
        break;

      case '7': // === SORT RECORDS ===
        rl.question('Sort by (1) Name or (2) Date? ', sortOption => {
            rl.question('Order (1) Ascending or (2) Descending? ', orderOption => {
                let sorted = [...db.listRecords()];
                
                if (sortOption === '1') { // Sort by Name
                    sorted.sort((a, b) => a.name.localeCompare(b.name));
                } else { // Sort by Date
                    sorted.sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
                }

                if (orderOption === '2') sorted.reverse(); // Descending

                console.log('--- Sorted Records ---');
                sorted.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`));
                menu();
            });
        });
        break;

      case '8': // === STATISTICS ===
        const statsData = db.listRecords();
        if (statsData.length === 0) {
            console.log('No records available for statistics.');
        } else {
            const total = statsData.length;
            // Find longest name
            const longest = statsData.reduce((a, b) => a.name.length > b.name.length ? a : b);
            // Dates (assuming 'created' exists)
            const validDates = statsData.filter(r => r.created).map(r => new Date(r.created));
            let earliest = 'N/A', latest = 'N/A';
            if (validDates.length > 0) {
                earliest = new Date(Math.min(...validDates)).toLocaleString();
                latest = new Date(Math.max(...validDates)).toLocaleString();
            }

            console.log(`
Vault Statistics:
--------------------------
Total Records: ${total}
Longest Name: ${longest.name} (${longest.name.length} chars)
Earliest Record: ${earliest}
Latest Record: ${latest}
            `);
        }
        menu();
        break;

      case '9':
        console.log('Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
