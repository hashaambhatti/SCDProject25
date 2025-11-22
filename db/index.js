const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const fs = require('fs');       // Added for Backup
const path = require('path');   // Added for Backup

// --- HELPER: Automatic Backup Function ---
function createBackup(data) {
    const backupDir = path.join(__dirname, '../backups');
    // Agar folder nahi hai to banao
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    // File name format: backup_2025-11-22_15-30-10.json
    const now = new Date();
    const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    const filename = `backup_${timestamp}.json`;
    
    fs.writeFileSync(path.join(backupDir, filename), JSON.stringify(data, null, 2));
    console.log(`\n[System] Automatic backup created: ${filename}`);
}

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  
  // UPDATED: Ab hum 'created' date bhi save kar rahay hain
  const newRecord = { 
      id: recordUtils.generateId(), 
      name, 
      value,
      created: new Date().toISOString() // Current Date/Time
  };
  
  data.push(newRecord);
  fileDB.writeDB(data);
  
  // TRIGGER BACKUP
  createBackup(data);
  
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  
  // TRIGGER BACKUP
  createBackup(data);
  
  vaultEvents.emit('recordDeleted', record);
  return record;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };
