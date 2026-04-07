#!/usr/bin/env node

const { program } = require('commander');
const SyncViz = require('../src/index.js');
const fs = require('fs');
const path = require('path');

program
  .name('sync-viz')
  .description('🚀 Beautiful file synchronization tool with real-time progress visualization')
  .version('1.0.0');

program
  .command('sync <source> <target>')
  .description('Sync files from source to target directory')
  .option('-d, --dry-run', 'Show what would be copied without actually copying', false)
  .option('-r, --recursive', 'Sync directories recursively', true)
  .option('-i, --ignore <patterns...>', 'Ignore files matching these patterns', [])
  .option('-v, --verbose', 'Show detailed output', false)
  .option('-w, --watch', 'Watch for changes and sync automatically', false)
  .action(async (source, target, options) => {
    try {
      const syncViz = new SyncViz({
        dryRun: options.dryRun,
        recursive: options.recursive,
        ignore: options.ignore,
        verbose: options.verbose,
        watch: options.watch
      });

      console.log('🚀 Starting synchronization...');
      console.log(`📁 Source: ${path.resolve(source)}`);
      console.log(`📁 Target: ${path.resolve(target)}\n`);

      const result = await syncViz.sync(source, target);
      
      console.log('\n✨ Sync completed!');
      console.log(`📊 Summary:`);
      console.log(`  • Files processed: ${result.totalFiles}`);
      console.log(`  • Files copied: ${result.copiedFiles}`);
      console.log(`  • Files skipped: ${result.skippedFiles}`);
      console.log(`  • Files failed: ${result.failedFiles}`);
      console.log(`  • Total size: ${formatSize(result.totalSize)}`);
      
      if (result.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        result.errors.forEach(error => {
          console.log(`  • ${error}`);
        });
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('check <source> <target>')
  .description('Check differences between source and target directories')
  .option('-v, --verbose', 'Show detailed output', false)
  .action(async (source, target, options) => {
    try {
      const syncViz = new SyncViz({ verbose: options.verbose });
      const differences = await syncViz.checkDifferences(source, target);
      
      console.log('🔍 Difference check results:');
      console.log(`📁 Source: ${path.resolve(source)}`);
      console.log(`📁 Target: ${path.resolve(target)}\n`);
      
      if (differences.length === 0) {
        console.log('✅ Directories are identical!');
      } else {
        console.log(`📊 Found ${differences.length} differences:\n`);
        
        differences.forEach(diff => {
          const status = diff.status === 'missing' ? '❌' : 
                        diff.status === 'different' ? '⚠️' : '📄';
          console.log(`${status} ${diff.path}`);
          if (diff.details) {
            console.log(`   ${diff.details}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  });

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

program.parse();