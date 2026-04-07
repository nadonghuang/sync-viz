<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/Zero_Deps-✅-success?style=for-the-badge" alt="Zero Deps"/>
  <img src="https://img.shields.io/badge/CLI-🚀-blue?style=for-the-badge" alt="CLI"/>
</p>

<h1 align="center">🚀 sync-viz</h1>

<p align="center">
  <strong>Beautiful file synchronization tool with real-time progress visualization</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Install</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-license">License</a>
</p>

---

**sync-viz** is a powerful command-line tool that synchronizes files between directories with beautiful, real-time progress visualization. It helps you keep your files in sync with confidence, showing you exactly what's happening during the sync process.

## ✨ Features

- 🎨 **Beautiful Progress Visualization** — Real-time progress bars and statistics
- 🚀 **Lightning Fast** — Zero dependencies, pure Node.js performance
- 🔍 **Smart Sync** — Detects file changes and skips identical files
- 📋 **Dry Run Mode** — See what would be copied before actually doing it
- 👁️ **Watch Mode** — Automatically sync files when they change
- 🎯 **Ignore Patterns** — Exclude files and directories you don't want to sync
- 📊 **Detailed Statistics** — Track files copied, skipped, and errors
- 🔧 **CLI Friendly** — Excellent command-line interface with help support
- 📁 **Recursive Sync** — Sync entire directory trees
- 🚫 **Error Handling** — Robust error handling and reporting

## 📦 Installation

```bash
npm install -g sync-viz
```

Or use npx:
```bash
npx sync-viz
```

## 🚀 Usage

### Basic Synchronization

```bash
# Sync source directory to target directory
sync-viz /path/to/source /path/to/target

# Sync with progress visualization
sync-viz ./src ./build --verbose
```

### Advanced Usage

```bash
# Dry run - see what would be copied
sync-viz ./project ./backup --dry-run

# Ignore specific file patterns
sync-viz ./data ./archive --ignore "*.tmp" "*.log"

# Watch for changes and auto-sync
sync-viz ./source ./target --watch

# Check differences between directories
sync-viz check ./source ./target --verbose
```

### Piping from stdin

```bash
# Use with other command-line tools
find ./files -name "*.js" | sync-viz /dev/stdin /target/js-files
```

## 📁 Project Structure

```
sync-viz/
├── src/           # Core source code
├── bin/           # CLI entry point
├── test.js        # Test suite
├── README.md      # This file
├── LICENSE
└── package.json
```

## 🛠️ Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show what would be copied without actually copying | `false` |
| `--recursive` | Sync directories recursively | `true` |
| `--ignore <patterns>` | Ignore files matching these patterns | `[]` |
| `--verbose` | Show detailed output | `false` |
| `--watch` | Watch for changes and sync automatically | `false` |

## 🎯 Examples

### Example 1: Backup Your Project

```bash
# Create a backup of your project
sync-viz ./my-project ./backups/my-project-$(date +%Y%m%d)
```

### Example 2: Sync Development Files

```bash
# Sync development files, ignoring node_modules and .git
sync-viz ./dev ./production \
  --ignore "node_modules" \
  --ignore ".git" \
  --ignore "*.log" \
  --verbose
```

### Example 3: Watch and Auto-Sync

```bash
# Automatically sync when files change
sync-viz ./source ./build --watch

# This will watch for file changes and sync them automatically
# Press Ctrl+C to stop watching
```

### Example 4: Check Before Syncing

```bash
# See what would be changed before actually syncing
sync-viz check ./source ./target --verbose

# Then perform the actual sync
sync-viz ./source ./target
```

## 🔧 Technical Details

### Smart Sync Algorithm

sync-viz uses a smart algorithm that:

1. **Compares file metadata** — Checks file size and modification time
2. **Calculates file hashes** — Uses MD5 checksums to verify file contents
3. **Tracks statistics** — Provides detailed information about the sync process
4. **Handles errors gracefully** — Continues syncing even if some files fail

### Performance Features

- **Zero Dependencies** — Built only with Node.js core modules
- **Streaming File Operations** — Uses streams for efficient file copying
- **Progressive Updates** — Updates progress in real-time without flickering
- **Memory Efficient** — Processes files one at a time to minimize memory usage

## 🚀 Roadmap

- [ ] Support for network file systems
- [ ] Configuration file support
- [ ] Plugin system for custom handlers
- [ ] Cloud storage integration
- [ ] Advanced conflict resolution strategies
- [ ] Performance optimization for large file sets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ⚡ by <a href="https://github.com/nadonghuang">nadonghuang</a>
  <br/>
  <sub>If you find this useful, please give it a ⭐!</sub>
</p>