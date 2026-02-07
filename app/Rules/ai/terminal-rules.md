# Terminal Command Rules for Windows

## Environment Detection
- OS: Windows 11
- Shell: PowerShell 7.x
- Project: Next.js with TypeScript
- Package Manager: npm (prefer pnpm in future)

## Command Patterns

### Creating Directories

**Single Directory:**
```powershell
mkdir lib/ai
```

**Multiple Directories (Same Level):**
```powershell
mkdir lib/ai, lib/github, lib/supabase
```

**Nested Directories:**
```powershell
mkdir -p lib/ai/tools/repository
# OR
New-Item -ItemType Directory -Force -Path lib/ai/tools/repository
```

**Multiple Nested Paths:**
```powershell
# Run separately, one per line
mkdir -p lib/ai/tools/repository
mkdir -p lib/github
mkdir -p components/chat
```

### File Operations

**Creating Files:**
```powershell
New-Item -Path lib/ai/agent.ts -ItemType File
# OR
ni lib/ai/agent.ts
```

**Multiple Files:**
```powershell
ni lib/ai/agent.ts, lib/ai/prompts.ts, lib/ai/workflows.ts
```

### Package Management

**Installing Packages:**
```powershell
npm install package-name
# NOT: npm i (use full command)
```

**Development Dependencies:**
```powershell
npm install -D package-name
```

**Multiple Packages:**
```powershell
npm install package1 package2 package3
# All on one line
```

### Running Scripts

**Development Server:**
```powershell
npm run dev
```

**Stop Process:**
- Use Ctrl+C
- Do NOT run `^C` as a command

### Path Rules

1. **Always use forward slashes:** `lib/ai/tools` ✅
2. **Never use backslashes:** `lib\ai\tools` ❌
3. **No quotes unless path has spaces:** `lib/ai` ✅, `"My Folder/file"` ✅

### Command Chaining

**PowerShell:**
```powershell
mkdir lib; cd lib
# Use semicolon (;) NOT ampersand (&&)
```

**Command Prompt:**
```powershell
mkdir lib && cd lib
# Use double ampersand (&&)
```

## Error Handling

### "Item already exists"
- Check if directory/file exists before creating
- Use `-Force` flag to overwrite: `mkdir -Force lib/ai`

### "Positional parameter not found"
- Issue: Multiple paths passed incorrectly
- Fix: Use comma-separated list OR run commands separately

### Commands Appearing Garbled
- Issue: Terminal encoding or escape characters
- Fix: Restart terminal, ensure UTF-8 encoding

## Best Practices for AI Editor

1. **Test commands before running**: Ask "Is this the correct syntax for PowerShell?"
2. **Break down complex operations**: One command per line
3. **Use full command names**: `New-Item` instead of aliases when unclear
4. **Check existing structure**: Don't recreate existing directories
5. **Provide rollback commands**: If something fails, how to undo?

## Preferred Command Format

When AI suggests commands, use this format:
```powershell
# What this does: Creates the AI tools directory structure
# Run these commands one by one:

mkdir -p lib/ai/tools/repository
mkdir -p lib/github  
mkdir -p components/chat

# Expected result: Directory structure created
# If error "already exists": Safe to ignore, directory exists
```