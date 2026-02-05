#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Notention + ClawdBot Development Environment...\n');

// Check if ClawdBot is installed
function checkClawdBot() {
  try {
    execSync('npm list clawdbot', { cwd: join(__dirname, 'agent'), stdio: 'pipe' });
    console.log('✅ ClawdBot dependency found');
    return true;
  } catch (error) {
    console.log('⚠️  ClawdBot not found in agent dependencies');
    try {
      execSync('npm install clawdbot@latest', { cwd: join(__dirname, 'agent'), stdio: 'inherit' });
      console.log('✅ ClawdBot installed successfully');
      return true;
    } catch (installError) {
      console.error('❌ Failed to install ClawdBot:', installError.message);
      return false;
    }
  }
}

// Build the UI if needed
function buildUI() {
  const uiDist = join(__dirname, 'ui', 'dist');
  if (!fs.existsSync(uiDist)) {
    console.log('📦 Building UI for agent server...');
    try {
      execSync('npm run build', { cwd: join(__dirname, 'ui'), stdio: 'inherit' });
      console.log('✅ UI built successfully for agent server');
    } catch (error) {
      console.error('❌ UI build failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ UI already built for agent server');
  }
}

// Build the core if needed
function buildCore() {
  const coreDist = join(__dirname, 'core', 'dist');
  if (!fs.existsSync(coreDist)) {
    console.log('⚙️  Building Core...');
    try {
      execSync('npm run build', { cwd: join(__dirname, 'core'), stdio: 'inherit' });
      console.log('✅ Core built successfully');
    } catch (error) {
      console.error('❌ Core build failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Core already built');
  }
}

// Start the agent server
function startAgent() {
  console.log('🤖 Starting Agent Server...');
  
  const agent = spawn('npm', ['run', 'start'], {
    cwd: join(__dirname, 'agent'),
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  agent.on('error', (err) => {
    console.error('❌ Agent server error:', err);
  });

  agent.on('close', (code) => {
    console.log(`🤖 Agent server exited with code ${code}`);
    process.exit(code);
  });

  return agent;
}

// Start the UI dev server if in development mode
function startUIDev() {
  console.log('🎨 Starting UI Development Server...');
  
  const ui = spawn('npm', ['run', 'dev'], {
    cwd: join(__dirname, 'ui'),
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  ui.on('error', (err) => {
    console.error('❌ UI dev server error:', err);
  });

  ui.on('close', (code) => {
    console.log(`🎨 UI dev server exited with code ${code}`);
  });

  return ui;
}

// Main function
async function main() {
  console.log('🔍 Checking prerequisites...\n');

  // Check for ClawdBot
  const hasClawdBot = checkClawdBot();
  if (!hasClawdBot) {
    console.error('Cannot proceed without ClawdBot');
    process.exit(1);
  }

  // Build dependencies
  buildCore();
  buildUI();

  console.log('\n🎮 Starting development servers...\n');

  // Start agent server (handles both UI serving and ClawdBot integration)
  const agentProcess = startAgent();

  // Set up cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down development environment...');
    if (agentProcess && !agentProcess.killed) {
      agentProcess.kill();
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep the main process alive
  process.on('exit', () => {
    console.log('Development environment terminated');
  });
}

// If this is run directly (not imported), execute main
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(err => {
    console.error('❌ Development environment startup failed:', err);
    process.exit(1);
  });
}

export { main };