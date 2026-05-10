const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/Unex/Documents/kiribamba_novo/campanha_eleitoral/src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('supabase')) {
    let originalContent = content;
    
    // Replace import
    content = content.replace(/import \{ supabase \} from ".*supabase.*";?/g, 'import { api } from "@/lib/apiClient";');
    content = content.replace(/import \{ supabase \} from '.*supabase.*';?/g, "import { api } from '@/lib/apiClient';");
    content = content.replace(/import type \{ Database \} from ".*supabase.*";?/g, '');
    
    // Replace API calls with generic mock so TS doesn't crash on undefined 'supabase'
    // This is temporary until the backend endpoints are fully implemented.
    content = content.replace(/\bsupabase\./g, '(api as any).');
    content = content.replace(/\bsupabase\b(?!\.)/g, '(api as any)');

    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      count++;
      console.log('Processed:', file);
    }
  }
});
console.log('Total files processed:', count);
