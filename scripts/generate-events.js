#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const EVENTS_DIR = path.join(__dirname, '..', 'images', 'events');
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive:true}); }

function buildEventIndex(eventFolder){
  const eventPath = path.join(EVENTS_DIR, eventFolder);
  const indexFile = path.join(eventPath, 'index.json');
  
  if(!fs.existsSync(eventPath)){
    console.warn(`No event folder found at ${eventPath}`);
    return;
  }

  const files = fs.readdirSync(eventPath)
    .filter(f => ALLOWED_EXT.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f=>({ 
      src: path.posix.join('images','events', eventFolder, f), 
      alt: path.basename(f, path.extname(f)).replace(/[-_]/g,' ') 
    }));

  fs.writeFileSync(indexFile, JSON.stringify(files, null, 2), 'utf8');
  console.log(`Wrote ${files.length} items to ${indexFile}`);
}

// Generate index for all event folders
if(fs.existsSync(EVENTS_DIR)){
  const eventFolders = fs.readdirSync(EVENTS_DIR)
    .filter(f => fs.statSync(path.join(EVENTS_DIR, f)).isDirectory());
  
  eventFolders.forEach(buildEventIndex);
} else {
  console.warn('No events directory found at', EVENTS_DIR);
}