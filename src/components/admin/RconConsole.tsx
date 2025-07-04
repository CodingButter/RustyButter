import { useState } from 'react'

export function RconConsole() {
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState<string[]>([
    'RCON Console Ready...',
    'Type "help" for available commands'
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    // Add to output
    setOutput(prev => [...prev, `> ${command}`])
    
    // Add to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)

    // Simulate command response
    if (command.toLowerCase() === 'help') {
      setOutput(prev => [...prev, 
        'Available commands:',
        '  status - Show server status',
        '  players - List online players',
        '  say <message> - Broadcast message',
        '  kick <player> - Kick a player',
        '  ban <player> - Ban a player',
        '  save - Save server state'
      ])
    } else if (command.toLowerCase() === 'status') {
      setOutput(prev => [...prev, 'Server is running normally'])
    } else {
      setOutput(prev => [...prev, `Executing: ${command}...`, 'Command executed successfully'])
    }

    setCommand('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand('')
      }
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading mb-8">RCON Console</h1>

      <div className="bg-black/80 backdrop-blur-sm rounded-xl border border-accent-primary/30 p-6 font-mono">
        {/* Console Output */}
        <div className="h-96 overflow-y-auto mb-4 space-y-1">
          {output.map((line, index) => (
            <div 
              key={index} 
              className={`text-sm ${
                line.startsWith('>') 
                  ? 'text-accent-primary' 
                  : line.includes('Error') 
                  ? 'text-red-400'
                  : 'text-gray-300'
              }`}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Command Input */}
        <form onSubmit={handleCommand} className="flex gap-2">
          <span className="text-accent-primary">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-300 focus:outline-none"
            placeholder="Enter RCON command..."
            autoFocus
          />
        </form>
      </div>

      {/* Quick Commands */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-heading mb-3">Quick Commands</h3>
        <div className="flex flex-wrap gap-2">
          {['status', 'players', 'save', 'say Hello everyone!'].map(cmd => (
            <button
              key={cmd}
              onClick={() => setCommand(cmd)}
              className="px-4 py-2 bg-surface-card/20 hover:bg-surface-card/30 text-body rounded-lg transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}