#!/bin/bash

# AbaQuest Environment Health Check (Unix)

# Helper functions
write_success() { echo -e "\033[0;32m[SUCCESS] $1\033[0m"; }
write_error() { echo -e "\033[0;31m[ERROR]   $1\033[0m"; }
write_info() { echo -e "\033[0;36m[INFO]    $1\033[0m"; }
write_header() { echo -e "\033[1;33m\n--- $1 ---\n\033[0m"; }

write_header "AbaQuest Environment Health Check"

# 1. Check Node.js
if command -v node >/dev/null 2>&1; then
    write_success "Node.js is installed ($(node -v))"
else
    write_error "Node.js is not found in PATH."
fi

# 2. Check .env.local
ENV_PATH=".env.local"
if [ -f "$ENV_PATH" ]; then
    write_success ".env.local found"
    REQUIRED_KEYS=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_PROJECT_ID" "VITE_ELEVENLABS_VOICE_ID")
    for key in "${REQUIRED_KEYS[@]}"; do
        if grep -q "$key=" "$ENV_PATH"; then
            write_info "  Confirmed: $key is set"
        else
            write_error "  Missing: $key in .env.local"
        fi
    done
else
    write_error ".env.local not found. Please create it from .env.example."
fi

# 3. Check for Git Lock
GIT_LOCK=".git/index.lock"
if [ -f "$GIT_LOCK" ]; then
    write_error "Git lock found ($GIT_LOCK). This may block git commands."
    write_info "  Fix: Close all VS Code instances or kill git processes, then delete the file."
else
    write_success "No git lock detected"
fi

# 4. Check for JSON Server
if command -v nc >/dev/null 2>&1; then
    if nc -z localhost 3001 >/dev/null 2>&1; then
        write_success "JSON Server is reachable on port 3001"
    else
        write_info "JSON Server is not responding on port 3001 (Run 'npm run server' to start)"
    fi
else
    write_info "Skip JSON Server check (nc command not found)"
fi

# 5. Check Ollama
if command -v ollama >/dev/null 2>&1; then
    write_success "Ollama is installed ($(ollama --version))"
else
    write_info "Ollama is not found in PATH or not running."
fi

echo -e "\n\033[1;33mHealth check complete.\033[0m\n"
