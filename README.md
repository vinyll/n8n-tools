
# n8n-tools

A collection of command-line tools for n8n workflow automation. Streamline debugging, testing, and sharing of n8n workflows with these developer-friendly utilities.

## Tools in this Collection

| Tool | Description | Status |
|------|-------------|--------|
| [curlify](#curlify) | Convert n8n HTTP request JSON logs to curl commands | ✅ Available |
| n8n-to-postman | Convert n8n workflows to Postman collections | 🔜 Planned |
| n8n-debugger | Enhanced debugging utilities for n8n | 🔜 Planned |
| n8n-exporter | Export workflows with dependencies | 🔜 Planned |

## 🚀 Quick Start

### Remote Execution (No Installation Required)

Run any tool directly without downloading or installing:

```bash
# Using npx with GitHub (package not yet published to npm)
npx github:vinyll/n8n-tools curlify '{"method":"GET","url":"https://api.example.com"}'

# Using Node.js with direct URL
node -e "$(curl -fsSL https://raw.githubusercontent.com/vinyll/n8n-tools/main/curlify.js)" -- '{"method":"GET","url":"https://example.com"}'

# One-liner with curl and node
curl -fsSL https://raw.githubusercontent.com/vinyll/n8n-tools/main/curlify.js | node - -- '{"method":"GET","url":"https://example.com"}'
```

### Local Installation

```bash
# Install from GitHub (package not yet published to npm)
npm install -g github:vinyll/n8n-tools

# Or install locally from GitHub
npm install github:vinyll/n8n-tools

# Use individual tools (after global installation)
curlify '{"method":"GET","url":"https://api.example.com"}'
```

## 📦 curlify

The first tool in the collection - convert n8n HTTP request JSON logs into executable `curl` commands.

### Why curlify?

When debugging n8n HTTP requests, you often need to:
- Test requests outside of n8n workflows
- Share requests with team members
- Debug failing APIs independently
- Compare request behavior between n8n and other tools

curlify solves this by converting n8n's HTTP request configuration (from the "Error Output" > "Request" tab) into ready-to-run curl commands.

### Usage Examples

```bash
# Simple GET request
curlify '{"method":"GET","url":"https://api.example.com/users"}'

# POST with JSON body
curlify '{"method":"POST","url":"https://api.example.com/users","headers":{"Content-Type":"application/json"},"body":{"name":"John","age":30},"json":true}'

# From n8n workflow error output (copy from Error Output > Request)
curlify '{"headers":{"accept":"application/json","user-agent":"n8n"},...}'

# Read from file
curlify path/to/n8n-request.json

# Pipe JSON
echo '{"method":"DELETE","url":"https://api.example.com/resource/123"}' | xargs curlify
```

### From n8n Workflow

1. Add an HTTP Request node to your workflow
2. Configure your request as needed
3. Enable "Error Output" > "Request" in node settings
4. Run the workflow and copy the JSON from error output
5. Run: `curlify 'your_copied_json'`

### Supported n8n Request Properties

| Property | Description | curl Equivalent |
|----------|-------------|-----------------|
| `method` | HTTP method | `-X METHOD` |
| `url` / `uri` | Request URL | URL argument |
| `headers` | HTTP headers | `-H 'Key: Value'` |
| `body` + `json: true` | JSON body | `-d '{"json":"body"}'` |
| `form` | Form data | `-d 'key=value&...'` |
| `body` (raw) | Raw body | `-d 'raw text'` |
| `gzip: true` | Gzip compression | `--compressed` |
| `rejectUnauthorized: false` | Skip SSL verification | `-k` |
| `followRedirect` | Follow redirects | `-L` |
| `timeout` (ms) | Request timeout | `--max-time SECONDS` |
| `resolveWithFullResponse` | Include response headers | `-i` |

## 🌐 Web Service (Coming Soon)

We're planning a web service where you can:
- Paste n8n JSON and get curl commands instantly
- Share curl commands via URL
- Save and organize converted requests
- Collaborate with team members

## 🛠️ Development

### Adding New Tools

1. Create a new JS file with your tool logic
2. Add entry to `package.json` `bin` section
3. Update this README with tool documentation
4. Submit a pull request

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-tool`
3. Commit changes: `git commit -m 'Add your tool'`
4. Push to branch: `git push origin feature/your-tool`
5. Open a Pull Request

Please ensure:
- Tools are focused on n8n workflow automation
- Code follows existing style and patterns
- Includes documentation and examples
- Works with remote execution via npx

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Issues**: Open a GitHub issue with example JSON and expected behavior
- **Feature Requests**: Suggest new tools or improvements
- **Questions**: Include your n8n version and environment details

## 🔗 Links

- [n8n Official Website](https://n8n.io)
- [n8n Documentation](https://docs.n8n.io)
- [GitHub Repository](https://github.com/vinyll/n8n-tools)

---

*Making n8n development easier, one tool at a time.*
