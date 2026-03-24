'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Ps1 from './Ps1'
import { commands, getCompletions } from './commands'
import type { CommandResult } from './commands'

interface HistoryEntry {
  command: string
  output: string
}

export default function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [initialized, setInitialized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Show banner on mount
  useEffect(() => {
    if (!initialized) {
      const result = commands['banner']([])
      if (result && 'output' in result) {
        setHistory([{ command: 'banner', output: (result as CommandResult).output }])
      }
      setInitialized(true)
    }
  }, [initialized])

  // Auto-enter after 3 seconds
  useEffect(() => {
    if (!initialized) return
    const timer = setTimeout(() => {
      setHistory(prev => [...prev, { command: 'data', output: 'Auto-entering DATA CENTER...' }])
      setTimeout(() => router.push('/data'), 500)
    }, 3000)
    // Cancel auto-enter if user types anything
    const cancelAuto = () => clearTimeout(timer)
    window.addEventListener('keydown', cancelAuto, { once: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', cancelAuto)
    }
  }, [initialized, router])

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [history, input])

  // Focus input on click anywhere
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    const [commandName, ...args] = trimmed.split(' ')
    const commandFn = commands[commandName.toLowerCase()]

    if (commandFn) {
      const result = await commandFn(args)

      if (result.output === '__CLEAR__') {
        setHistory([])
        return
      }

      setHistory(prev => [...prev, { command: trimmed, output: result.output }])

      if (result.navigate) {
        setTimeout(() => router.push(result.navigate!), 600)
      }
    } else {
      setHistory(prev => [...prev, {
        command: trimmed,
        output: `${commandName}: command not found. Type 'help' for available commands.`
      }])
    }
  }, [router])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input)
      setInput('')
      setHistoryIndex(-1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const cmds = history.map(h => h.command)
      if (cmds.length > 0 && historyIndex < cmds.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(cmds[cmds.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        const cmds = history.map(h => h.command)
        setInput(cmds[cmds.length - 1 - newIndex])
      } else {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const completions = getCompletions(input)
      if (completions.length === 1) {
        setInput(completions[0])
      }
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setHistory([])
    }
  }, [input, history, historyIndex, executeCommand])

  return (
    <div
      ref={containerRef}
      onClick={focusInput}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#1d2021',
        color: '#ebdbb2',
        fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
        fontSize: '14px',
        lineHeight: '1.6',
        padding: '20px',
        overflowY: 'auto',
        cursor: 'text',
        border: '2px solid #b8f53e',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* History */}
      {history.map((entry, i) => (
        <div key={i} style={{ marginBottom: '4px' }}>
          {/* Command line */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Ps1 />
            <span>{entry.command}</span>
          </div>
          {/* Output */}
          <pre style={{
            margin: 0,
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#ebdbb2',
          }}>
            {entry.output}
          </pre>
        </div>
      ))}

      {/* Current input line */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Ps1 />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ebdbb2',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            padding: 0,
            caretColor: '#b8f53e',
          }}
        />
      </div>
    </div>
  )
}
