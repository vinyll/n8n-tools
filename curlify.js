#!/usr/bin/env node

/**
 * curlify - Convert n8n HTTP request JSON logs to curl commands
 * 
 * Converts n8n HTTP request configuration (from Error Output > Request) 
 * into executable curl commands for debugging, sharing and testing.
 * 
 * Usage: curlify '<json_string>'
 *        curlify path/to/file.json
 *        curlify --help
 * 
 * The n8n output is from the Error Output > Request of an HTTPRequest node
 * and typically starts with: `{"headers": {"accept": "application/json", ...}}`
 */

const fs = require('fs')

/**
 * Convert n8n request configuration to curl command
 * @param {Object} config - n8n HTTP request configuration
 * @returns {string} curl command string
 */
function jsonToCurl(config) {
  const parts = ['curl']

  // Method
  const method = (config.method || 'GET').toUpperCase()
  if (method !== 'GET') {
    parts.push(`-X ${method}`)
  }

  // Headers
  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      const escapedValue = value.replace(/'/g, "'\\''")
      parts.push(`-H '${key}: ${escapedValue}'`)
    }
  }

  // Form data (application/x-www-form-urlencoded)
  if (config.form) {
    const formParts = []
    for (const [key, value] of Object.entries(config.form)) {
      const encodedKey = encodeURIComponent(key)
      const encodedValue = encodeURIComponent(value ?? '')
      formParts.push(`${encodedKey}=${encodedValue}`)
    }
    if (formParts.length > 0) {
      parts.push(`-d '${formParts.join('&')}'`)
    }
  }

  // JSON body
  if (config.body && config.json) {
    const bodyStr = typeof config.body === 'string'
      ? config.body
      : JSON.stringify(config.body)
    const escapedBody = bodyStr.replace(/'/g, "'\\''")
    parts.push(`-d '${escapedBody}'`)
  }

  // Raw body (when not form or json)
  if (config.body && !config.json && !config.form) {
    const bodyStr = typeof config.body === 'string'
      ? config.body
      : JSON.stringify(config.body)
    const escapedBody = bodyStr.replace(/'/g, "'\\''")
    parts.push(`-d '${escapedBody}'`)
  }

  // Gzip
  if (config.gzip) {
    parts.push('--compressed')
  }

  // Insecure (skip SSL verification)
  if (config.rejectUnauthorized === false) {
    parts.push('-k')
  }

  // Follow redirects
  if (config.followRedirect || config.followAllRedirects) {
    parts.push('-L')
  }

  // Timeout (convert ms to seconds)
  if (config.timeout) {
    const timeoutSec = Math.ceil(config.timeout / 1000)
    parts.push(`--max-time ${timeoutSec}`)
  }

  // Include response headers in output
  if (config.resolveWithFullResponse) {
    parts.push('-i')
  }

  // URL (use uri or url)
  const url = config.uri || config.url
  if (url) {
    parts.push(`'${url}'`)
  }

  return parts.join(' \\\n  ')
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
curlify - Convert n8n HTTP request JSON logs to curl commands

Usage:
  curlify '<json_string>'        Convert JSON string to curl command
  curlify <file_path>           Read JSON from file and convert
  curlify --help, -h            Show this help message
  curlify --version, -v         Show version information

Examples:
  curlify '{"method":"GET","url":"https://api.example.com"}'
  curlify n8n-request.json
  echo '{"method":"POST","url":"..."}' | xargs curlify

Input JSON format:
  Copy from n8n HTTP Request node Error Output > Request tab.
  The JSON typically starts with: {"headers": {...}, "method": "...", ...}

Supported n8n properties:
  method, url/uri, headers, body, json, form, gzip, rejectUnauthorized,
  followRedirect, followAllRedirects, timeout, resolveWithFullResponse

Installation options:
  npx n8n-tools curlify '<json>'   # Run without installation
  npm install -g n8n-tools         # Install globally
  curlify '<json>'                 # Use after global install
`)
}

/**
 * Show version information
 */
function showVersion() {
  const packageJson = require('./package.json')
  console.log(`curlify v${packageJson.version}`)
  console.log('Part of n8n-tools collection')
}

/**
 * Main function
 * @param {string} input - JSON string or file path
 */
function convert(input) {
  if (!input) {
    console.error('Error: No input provided')
    showHelp()
    process.exit(1)
  }

  let jsonData

  // Try to read as file first
  if (fs.existsSync(input)) {
    try {
      const fileContent = fs.readFileSync(input, 'utf-8')
      jsonData = JSON.parse(fileContent)
    } catch (e) {
      console.error(`Error reading file: ${e.message}`)
      process.exit(1)
    }
  } else {
    // Try to parse as JSON string
    try {
      jsonData = JSON.parse(input)
    } catch (e) {
      console.error(`Error parsing JSON: ${e.message}`)
      console.error('Make sure to wrap the JSON in quotes: curlify \'{"json": "here"}\'')
      process.exit(1)
    }
  }

  const curlCommand = jsonToCurl(jsonData)
  console.log(curlCommand)
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2)

  // Handle flags
  if (args.length === 0) {
    console.error('Error: No input provided')
    showHelp()
    process.exit(1)
  }

  const firstArg = args[0]

  switch (firstArg) {
    case '--help':
    case '-h':
      showHelp()
      process.exit(0)
      break

    case '--version':
    case '-v':
      showVersion()
      process.exit(0)
      break

    default:
      convert(firstArg)
      break
  }
}

// Export for programmatic use
module.exports = {
  jsonToCurl,
  convert,
  showHelp,
  showVersion
}

// Run if called directly
if (require.main === module) {
  main()
}