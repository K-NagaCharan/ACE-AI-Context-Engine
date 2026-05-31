# ACE Track

ACE Track is a CLI tool that creates portable AI-readable project memory.

It tracks Git commits, extracts meaningful development context using an LLM, and stores structured project history that can later be exported and handed off to another AI system.

The goal of ACE Track is to solve the context-loss problem that happens when developers switch between:

* ChatGPT
* Codex
* Claude
* Gemini
* Cursor
* Local LLMs
* Other AI coding tools

Instead of repeatedly explaining the project from scratch, ACE Track builds semantic project memory over time.

---

# Features

* Git-based project tracking
* AI-generated commit summaries
* Structured project memory storage
* Provider-agnostic AI integration
* OpenAI-compatible API support
* Export system for AI handoff
* Read-only project status dashboard
* Local LLM support via Ollama
* Incremental commit processing
* Portable context generation

---

# Architecture

```text
Git Commits
    ↓
Context Engine
    ↓
AI Summarization
    ↓
Structured Memory
    ↓
Export System
```

ACE Track converts raw Git history into structured semantic memory.

---

# Installation

## Global Installation

You can install ACE Track globally directly using npm:

```bash
npm install -g ace-track
```

Alternatively, you can install and run it locally from the source:

## Clone Repository

```bash
git clone <repo-url>
cd ace-track
```

## Install Dependencies

```bash
npm install
```

## Link CLI Locally

```bash
npm link
```

You can now use:

```bash
ace-track
```

from anywhere on your system.

## Running Tests

ACE Track has a robust Jest test suite to verify internal logic. Run the tests with:

```bash
npm test
```

---

# Supported AI Providers

ACE Track works with any OpenAI-compatible API.

Examples:

* OpenAI
* Ollama
* Gemini OpenAI Compatibility API
* OpenRouter
* LM Studio
* Local inference servers

---

# Environment Configuration

Create a `.env` file inside the project you want to track.

Example for Ollama:

```env
ACE_API_KEY=dummy
ACE_BASE_URL=http://localhost:11434/v1
ACE_MODEL=gemma3:12b
```

Example for Gemini:

```env
ACE_API_KEY=your_api_key
ACE_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
ACE_MODEL=gemini-2.5-flash
```

---

# Project Initialization

Inside your project repository:

```bash
ace-track init
```

This creates:

```text
.ace/
├── config.json
└── project.ai.json
```

---

# Commands

## Initialize ACE

```bash
ace-track init
```

Interactive project setup.

---

## Initialize Quickly

```bash
ace-track init -y
```

Skips interactive setup.

---

## Update Project Memory

```bash
ace-track update
```

Processes new commits since the last update.

Optional developer note:

```bash
ace-track update --note "implemented authentication system"
```

---

## Project Status

```bash
ace-track status
```

Displays:

* Project information
* Total entries
* Last processed commit
* Recent project history

---

## Export AI Context

```bash
ace-track export
```

Generates portable AI-readable project context.

---

## Export Markdown File

```bash
ace-track export --format md
```

Creates:

```text
ace-export.md
```

---

## Copy Export to Clipboard

```bash
ace-track export --to-clipboard
```

Copies export directly to clipboard.

---

# Example Workflow

## 1. Initialize Project

```bash
ace-track init
```

---

## 2. Make Changes

```bash
git add .
git commit -m "added authentication system"
```

---

## 3. Update ACE Memory

```bash
ace-track update --note "using JWT for scalability"
```

---

## 4. Export Context

```bash
ace-track export --to-clipboard
```

Paste the exported context into another AI system.

---

# Storage Structure

## `config.json`

Tracks processing state.

```json
{
  "last_processed_commit": "88de87e",
  "max_commits_per_update": 5
}
```

---

## `project.ai.json`

Stores structured semantic project memory.

Example:

```json
{
  "commit": "88de87e",
  "message": "added context engine",
  "timestamp": "2026-05-10T08:41:05.535Z",
  "files": [
    "src/core/context.js"
  ],
  "note": "testing AI integration",
  "summary": "Implemented structured context transformation.",
  "key_changes": [
    "Added buildContext function",
    "Added diff extraction"
  ],
  "impact": "Enables AI-readable project memory."
}
```

---

# Design Decisions

## Incremental Commit Processing

ACE Track processes only commits that were not previously analyzed.

This avoids:

* repeated AI calls
* duplicate summaries
* unnecessary token usage

---

## `.ace/` Isolation

ACE ignores its own metadata files during analysis.

**During initialization, `ace-track init` automatically adds `.ace/` to your `.gitignore` file to ensure metadata remains isolated.**

This prevents recursive summaries like:

```text
AI summaries about AI summaries
```

---

## Human Intent Preservation

ACE stores both:

* raw developer commit messages
* AI-generated semantic summaries

This preserves:

* human intent
* AI interpretation

simultaneously.

---

# Current MVP Scope

The current version focuses on:

* semantic commit tracking
* AI summarization
* portable project context
* local-first workflows

Not yet included:

* VS Code extension
* MCP integration
* Semantic clustering
* Multi-developer synchronization
* Vector memory search

---

# Development Philosophy

ACE Track is designed around one core idea:

> Project continuity should survive across AI systems.

The tool treats commits as:

```text
AI-interpreted development events
```

instead of simple Git history.
