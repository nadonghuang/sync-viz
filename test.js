const SyncViz = require('./src/index.js');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

async function createTestFiles() {
  const testDir = path.join(os.tmpdir(), 'sync-viz-test');
  const sourceDir = path.join(testDir, 'source');
  const targetDir = path.join(testDir, 'target');

  // Clean up any existing test files
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }

  // Create test directories
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(targetDir, { recursive: true });

  // Create test files
  const testFiles = [
    { name: 'file1.txt', content: 'Hello, World!\n' },
    { name: 'file2.txt', content: 'This is a test file.\n' },
    { name: 'subdir/file3.txt', content: 'Nested file content.\n' }
  ];

  for (const file of testFiles) {
    const filePath = path.join(sourceDir, file.name);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, file.content);
  }

  return { sourceDir, targetDir };
}

async function runTest() {
  try {
    console.log('🧪 Running SyncViz tests...\n');
    
    const { sourceDir, targetDir } = await createTestFiles();
    
    // Test dry run
    console.log('📋 Testing dry run...');
    const syncViz = new SyncViz({ dryRun: true, verbose: true });
    const result1 = await syncViz.sync(sourceDir, targetDir);
    console.log(`   Dry run result: ${result1.copiedFiles} files would be copied\n`);
    
    // Test actual sync
    console.log('🚀 Testing actual sync...');
    const syncViz2 = new SyncViz({ verbose: true });
    const result2 = await syncViz2.sync(sourceDir, targetDir);
    console.log(`   Sync result: ${result2.copiedFiles} files copied\n`);
    
    // Test differences check
    console.log('🔍 Testing differences check...');
    const differences = await syncViz2.checkDifferences(sourceDir, targetDir);
    console.log(`   Differences found: ${differences.length}\n`);
    
    // Clean up
    await fs.rm(path.join(os.tmpdir(), 'sync-viz-test'), { recursive: true, force: true });
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runTest();
}

module.exports = { runTest };