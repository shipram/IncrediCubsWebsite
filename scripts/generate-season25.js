#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'images', 'season25');
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_FILE = path.join(OUT_DIR, 'season25.json');
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive:true}); }

function buildIndex(){
  ensureDir(OUT_DIR);
  if(!fs.existsSync(IMAGES_DIR)){
    console.warn('No season25 folder found at', IMAGES_DIR, '- creating empty index.');
    fs.writeFileSync(OUT_FILE, '[]', 'utf8');
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => ALLOWED_EXT.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f=>({ src: path.posix.join('images','season25', f), alt: path.basename(f, path.extname(f)).replace(/[-_]/g,' ') }));

  fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2), 'utf8');
  console.log(`Wrote ${files.length} items to ${OUT_FILE}`);
}

buildIndex();
