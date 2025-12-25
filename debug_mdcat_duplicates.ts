// Debug script to check for and remove duplicate MDCAT subjects
// Run this in browser console: copy and paste the entire content

import { db } from './src/db/db';

async function fixMDCATDuplicates() {
  console.log('🔍 Checking for MDCAT duplicates...');
  
  // Find MDCAT Prep parent
  const mdcatParent = await db.subjects
    .where('name').equals('MDCAT Prep')
    .and(s => !s.parentId)
    .first();
    
  if (!mdcatParent) {
    console.log('❌ MDCAT Prep parent not found');
    return;
  }
  
  console.log('✅ Found MDCAT Prep parent:', mdcatParent);
  
  // Get all children
  const allChildren = await db.subjects
    .where('parentId').equals(mdcatParent.id)
    .toArray();
    
  console.log(`📊 Total MDCAT children: ${allChildren.length}`);
  console.log('Children:', allChildren.map(s => ({ id: s.id, name: s.name })));
  
  // Group by name
  const grouped = new Map();
  for (const subject of allChildren) {
    const name = subject.name;
    if (!grouped.has(name)) {
      grouped.set(name, []);
    }
    grouped.get(name).push(subject);
  }
  
  // Find duplicates
  const duplicates = [];
  for (const [name, subjects] of grouped.entries()) {
    if (subjects.length > 1) {
      console.log(`⚠️  Found ${subjects.length} duplicates of "${name}"`);
      duplicates.push({ name, subjects });
    }
  }
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }
  
  // Remove duplicates (keep first, delete rest)
  for (const { name, subjects } of duplicates) {
    const [keep, ...remove] = subjects;
    console.log(`🗑️ Keeping ${name} (ID: ${keep.id}), removing ${remove.length} duplicates`);
    
    for (const subject of remove) {
      // Delete the subject and its topics
      await db.topics.where('subjectId').equals(subject.id).delete();
      await db.subjects.delete(subject.id);
      console.log(`  ✓ Deleted duplicate ${name} (ID: ${subject.id})`);
    }
  }
  
  console.log('✅ Cleanup complete!');
  
  // Verify
  const remainingChildren = await db.subjects
    .where('parentId').equals(mdcatParent.id)
    .toArray();
  console.log(`📊 Remaining MDCAT children: ${remainingChildren.length}`);
  console.log('Final list:', remainingChildren.map(s => s.name));
}

fixMDCATDuplicates().catch(console.error);
