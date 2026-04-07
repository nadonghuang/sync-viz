const fs = require('fs').promises;
const path = require('path');
const { createHash } = require('crypto');

class SyncViz {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.recursive = options.recursive !== false;
    this.ignore = options.ignore || [];
    this.verbose = options.verbose || false;
    this.watch = options.watch || false;
    this.progressBar = null;
    this.stats = {
      totalFiles: 0,
      copiedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      totalSize: 0,
      errors: []
    };
  }

  async sync(source, target) {
    this.stats = {
      totalFiles: 0,
      copiedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      totalSize: 0,
      errors: []
    };

    this.log('🔍 Analyzing source directory...', 'info');
    await this.ensureDirectoryExists(target);
    await this.processDirectory(source, target);
    
    if (this.watch) {
      this.log('👁️  Watching for changes... (Press Ctrl+C to stop)', 'info');
      await this.startWatching(source, target);
    }

    return this.stats;
  }

  async checkDifferences(source, target) {
    const differences = [];
    const sourceFiles = await this.getAllFiles(source);
    const targetFiles = await this.getAllFiles(target);

    for (const sourceFile of sourceFiles) {
      const relativePath = path.relative(source, sourceFile);
      const targetFile = path.join(target, relativePath);

      try {
        const sourceStats = await fs.stat(sourceFile);
        const targetStats = await fs.stat(targetFile);

        if (sourceStats.mtime.getTime() !== targetStats.mtime.getTime() ||
            sourceStats.size !== targetStats.size) {
          differences.push({
            path: relativePath,
            status: 'different',
            details: `Source: ${sourceStats.mtime.toISOString()}, Size: ${sourceStats.size} bytes` +
                    `Target: ${targetStats.mtime.toISOString()}, Size: ${targetStats.size} bytes`
          });
        }
      } catch (error) {
        differences.push({
          path: relativePath,
          status: 'missing',
          details: 'File exists in source but not in target'
        });
      }
    }

    return differences;
  }

  async processDirectory(sourceDir, targetDir) {
    const files = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file.name);
      const targetPath = path.join(targetDir, file.name);

      if (this.shouldIgnore(sourcePath)) {
        this.log(`🚫 Ignoring: ${sourcePath}`, 'ignore');
        continue;
      }

      if (file.isDirectory() && this.recursive) {
        await this.ensureDirectoryExists(targetPath);
        await this.processDirectory(sourcePath, targetPath);
        continue;
      }

      if (!file.isDirectory()) {
        await this.processFile(sourcePath, targetPath);
      }
    }
  }

  async processFile(sourcePath, targetPath) {
    try {
      const sourceStats = await fs.stat(sourcePath);
      this.stats.totalFiles++;
      this.stats.totalSize += sourceStats.size;

      let shouldCopy = true;
      let skipReason = '';

      try {
        const targetStats = await fs.stat(targetPath);
        const sourceHash = await this.getFileHash(sourcePath);
        const targetHash = await this.getFileHash(targetPath);

        if (targetStats.size === sourceStats.size && sourceHash === targetHash) {
          shouldCopy = false;
          skipReason = 'identical';
        } else if (targetStats.mtime >= sourceStats.mtime) {
          shouldCopy = false;
          skipReason = 'newer';
        }
      } catch (error) {
        // Target doesn't exist, should copy
      }

      if (!shouldCopy) {
        this.stats.skippedFiles++;
        this.log(`⏭️  Skipped: ${path.relative(process.cwd(), targetPath)} (${skipReason})`, 'skip');
        return;
      }

      this.showProgress();
      
      if (this.dryRun) {
        this.log(`📋 Would copy: ${path.relative(process.cwd(), sourcePath)} → ${path.relative(process.cwd(), targetPath)}`, 'dryrun');
        this.stats.copiedFiles++;
      } else {
        await this.ensureDirectoryExists(path.dirname(targetPath));
        await this.copyFile(sourcePath, targetPath);
        this.stats.copiedFiles++;
        this.log(`✅ Copied: ${path.relative(process.cwd(), targetPath)}`, 'success');
      }
    } catch (error) {
      this.stats.failedFiles++;
      const errorMessage = `❌ Failed to process ${path.relative(process.cwd(), sourcePath)}: ${error.message}`;
      this.stats.errors.push(errorMessage);
      this.log(errorMessage, 'error');
    }
  }

  async copyFile(source, target) {
    const sourceStream = fs.createReadStream(source);
    const targetStream = fs.createWriteStream(target);

    await new Promise((resolve, reject) => {
      sourceStream.pipe(targetStream);
      targetStream.on('finish', resolve);
      targetStream.on('error', reject);
      sourceStream.on('error', reject);
    });

    // Copy file permissions and timestamp
    const sourceStats = await fs.stat(source);
    await fs.chmod(target, sourceStats.mode);
    await fs.utimes(target, sourceStats.atime, sourceStats.mtime);
  }

  async getFileHash(filePath) {
    const hash = createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    await new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    return hash.digest('hex');
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        this.log(`📁 Created directory: ${dirPath}`, 'info');
      }
    }
  }

  async getAllFiles(dirPath) {
    const files = [];
    
    async function scanDirectory(currentPath) {
      const items = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item.name);
        
        if (this.shouldIgnore(itemPath)) {
          continue;
        }
        
        if (item.isDirectory()) {
          await scanDirectory.call(this, itemPath);
        } else {
          files.push(itemPath);
        }
      }
    }

    await scanDirectory.call(this, dirPath);
    return files;
  }

  shouldIgnore(filePath) {
    return this.ignore.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(filePath);
    });
  }

  showProgress() {
    const progress = this.stats.totalFiles > 0 ? 
      Math.round((this.stats.copiedFiles + this.stats.skippedFiles) / this.stats.totalFiles * 100) : 0;
    
    const barLength = 30;
    const filledLength = Math.round(barLength * progress / 100);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r📊 Progress: |${bar}| ${progress}% (${this.stats.copiedFiles}/${this.stats.totalFiles})`);
    
    if (progress === 100) {
      process.stdout.write('\n');
    }
  }

  log(message, type = 'info') {
    if (!this.verbose && type !== 'error') {
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      'info': `🔍 [${timestamp}]`,
      'success': `✅ [${timestamp}]`,
      'error': `❌ [${timestamp}]`,
      'skip': `⏭️  [${timestamp}]`,
      'ignore': `🚫 [${timestamp}]`,
      'dryrun': `📋 [${timestamp}]`
    }[type] || `ℹ️  [${timestamp}]`;

    console.log(`${prefix} ${message}`);
  }

  async startWatching(source, target) {
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch(source, {
      ignored: this.ignore,
      persistent: true
    });

    watcher.on('change', async (filePath) => {
      this.log(`👁️  Change detected: ${filePath}`, 'info');
      const relativePath = path.relative(source, filePath);
      const targetPath = path.join(target, relativePath);
      
      try {
        await this.processFile(filePath, targetPath);
      } catch (error) {
        this.log(`❌ Error processing change: ${error.message}`, 'error');
      }
    });

    process.on('SIGINT', () => {
      this.log('👋 Stopping watcher...', 'info');
      watcher.close();
      process.exit(0);
    });
  }
}

module.exports = SyncViz;