#!/usr/bin/env node

/**
 * Kill processes listening on specific ports
 * Cross-platform Node.js script for cleaning up orphaned dev servers
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORTS = [3001, 5173]; // API server and Vite dev server
const isWindows = process.platform === 'win32';

/**
 * Find and kill process on a specific port
 */
async function killPort(port) {
  try {
    if (isWindows) {
      // Windows: Use netstat to find PID, then taskkill
      const { stdout } = await execAsync(
        `netstat -ano | findstr "LISTENING" | findstr ":${port}"`
      );

      if (!stdout.trim()) {
        console.log(`  ✓ Port ${port} is already free`);
        return;
      }

      // Parse PIDs from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }

      // Kill each PID
      for (const pid of pids) {
        try {
          await execAsync(`taskkill /F /PID ${pid}`);
          console.log(`  ✓ Killed process ${pid} on port ${port}`);
        } catch (err) {
          console.log(`  ✗ Failed to kill PID ${pid}: ${err.message}`);
        }
      }

      // Wait for port to be released
      await new Promise(resolve => setTimeout(resolve, 500));

    } else {
      // Unix/Linux/Mac: Use lsof to find and kill
      try {
        const { stdout } = await execAsync(`lsof -ti:${port}`);
        const pids = stdout.trim().split('\n').filter(Boolean);

        if (pids.length === 0) {
          console.log(`  ✓ Port ${port} is already free`);
          return;
        }

        for (const pid of pids) {
          await execAsync(`kill -9 ${pid}`);
          console.log(`  ✓ Killed process ${pid} on port ${port}`);
        }

        // Wait for port to be released
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        if (err.code === 1 && !err.stdout) {
          // lsof returns exit code 1 when no processes found
          console.log(`  ✓ Port ${port} is already free`);
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error(`  ✗ Error checking port ${port}: ${err.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🧹 Cleaning up ports before starting servers...\n');

  for (const port of PORTS) {
    console.log(`[Port ${port}]`);
    await killPort(port);
  }

  console.log('\n✅ Port cleanup complete!\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { killPort };
