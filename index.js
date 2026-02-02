#!/usr/bin/env node

/**
 * n8n-tools - A collection of tools for n8n workflow automation
 * Main CLI dispatcher for the n8n-tools collection
 */

const fs = require('fs');
const path = require('path');

const VERSION = require('./package.json').version;

const availableTools = {
  curlify: {
    description: 'Convert n8n HTTP request JSON logs to curl commands',
    module: './curlify.js',
    usage: 'curlify [<json-string>|<file-path>]'
  }
  // Future tools will be added here
};

function printHelp() {
  console.log(`
n8n-tools v${VERSION} - A collection of tools for n8n workflow automation

Usage:
  npx @vinyll/n8n-tools <tool> [options]
  npx @vinyll/n8n-tools help
  npx @vinyll/n8n-tools version

Available tools:

${Object.entries(availableTools).map(([name, info]) => {
  return `  ${name.padEnd(12)} ${info.description}\n           Usage: ${info.usage}`;
}).join('\n\n')}

Examples:
  npx @vinyll/n8n-tools curlify '{"method":"GET","url":"https://api.example.com"}'
  npx @vinyll/n8n-tools help

Install globally for direct tool access:
  npm install -g @vinyll/n8n-tools
  curlify '{"method":"GET","url":"https://example.com"}'

Remote execution (no installation):
  npx @vinyll/n8n-tools curlify '<json>'
  curl -fsSL https://raw.githubusercontent.com/vinyll/n8n-tools/main/curlify.js | node - -- '<json>'

For detailed help on a specific tool, run the tool directly with --help:
  npx @vinyll/n8n-tools curlify --help
`);
}

function printVersion() {
  console.log(`n8n-tools v${VERSION}`);
}

function listTools() {
  console.log('Available tools:');
  Object.entries(availableTools).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(12)} ${info.description}`);
  });
}

function runTool(toolName, args) {
  if (!availableTools[toolName]) {
    console.error(`Error: Unknown tool "${toolName}"`);
    console.error();
    listTools();
    console.error(`\nRun "npx @vinyll/n8n-tools help" for more information.`);
    process.exit(1);
  }

  const toolInfo = availableTools[toolName];
  
  try {
    // Load the tool module
    const toolPath = path.resolve(__dirname, toolName + '.js');
    
    // Check if file exists
    if (!fs.existsSync(toolPath)) {
      console.error(`Error: Tool "${toolName}" module not found at ${toolPath}`);
      process.exit(1);
    }
    
    // Set up process.argv for the tool
    // The tool expects process.argv[2] to be the main argument
    // We'll create a modified argv array
    const originalArgv = process.argv;
    process.argv = [originalArgv[0], originalArgv[1], ...args];
    
    // Require the tool module
    require(toolPath);
    
    // Restore original argv (though process will likely exit)
    process.argv = originalArgv;
    
  } catch (error) {
    console.error(`Error running tool "${toolName}":`, error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error(`Make sure ${toolName}.js exists in the tools directory.`);
    }
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
      
    case 'version':
    case '--version':
    case '-v':
      printVersion();
      break;
      
    case 'list':
    case 'tools':
      listTools();
      break;
      
    default:
      // It's a tool name
      const toolArgs = args.slice(1);
      runTool(command, toolArgs);
      break;
  }
}

// Run only if this is the main module (not required)
if (require.main === module) {
  main();
}

module.exports = {
  availableTools,
  printHelp,
  printVersion,
  listTools,
  runTool
};