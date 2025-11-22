const readline = require('readline');
const db = require('./db');
const fs = require('fs');
require('./events/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault (MongoDB Edition) =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Export Data
6. Search Records
7. Sort Records
8. View Vault Statistics
9. Exit
=======================================
  `);

  rl.question('Choose option: ', async (ans) => { // Async function start
    try {
        switch (ans.trim()) {
        case '1':
            rl.question('Enter name: ', name => {
            rl.question('Enter value: ', async value => {
                await db.addRecord({ name, value });
                console.log('✅ Record added to MongoDB!');
                menu();
            });
            });
            break;

        case '2':
            const records = await db.listRecords();
            if (records.length === 0) console.log('No records found.');
            else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
            menu();
            break;

        case '3':
            rl.question('Enter record ID to update: ', async id => {
            rl.question('New name: ', name => {
                rl.question('New value: ', async value => {
                const updated = await db.updateRecord(Number(id), name, value);
                console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
                menu();
                });
            });
            });
            break;

        case '4':
            rl.question('Enter record ID to delete: ', async id => {
            const deleted = await db.deleteRecord(Number(id));
            console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
            menu();
            });
            break;

        case '5': // Export
            const allData = await db.listRecords();
            const exportContent = `Vault Export\nDate: ${new Date().toLocaleString()}\nTotal: ${allData.length}\n\n` +
                allData.map(r => `ID: ${r.id} | Name: ${r.name}`).join('\n');
            fs.writeFileSync('export.txt', exportContent);
            console.log('✅ Data exported to export.txt');
            menu();
            break;

        case '6': // Search
            rl.question('Enter keyword: ', async keyword => {
                const allRecords = await db.listRecords();
                const matches = allRecords.filter(r => 
                    r.name.toLowerCase().includes(keyword.toLowerCase()) || 
                    String(r.id).includes(keyword)
                );
                console.log(`Found ${matches.length} matches.`);
                matches.forEach(r => console.log(`- ${r.name}`));
                menu();
            });
            break;

        case '7': // Sort
            rl.question('Sort by (1) Name or (2) Date? ', async sortOption => {
                let sorted = await db.listRecords();
                if (sortOption === '1') sorted.sort((a, b) => a.name.localeCompare(b.name));
                else sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
                
                sorted.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name}`));
                menu();
            });
            break;

        case '8': // Stats
            const stats = await db.listRecords();
            console.log(`Total Records in DB: ${stats.length}`);
            menu();
            break;

        case '9':
            console.log('👋 Exiting...');
            process.exit(0);
            break;

        default:
            console.log('Invalid option.');
            menu();
        }
    } catch (error) {
        console.log("Error:", error.message);
        menu();
    }
  });
}

// Thora wait karein taake DB connect ho jaye phir menu dikhayen
setTimeout(menu, 1000);
// Feature Implementation Complete
