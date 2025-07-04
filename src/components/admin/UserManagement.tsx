import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
  email: string
  role: string
  vipStatus: boolean
  totalSpent: number
  createdAt: string
  lastLogin: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching users
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@rustybutter.com',
          role: 'admin',
          vipStatus: true,
          totalSpent: 0,
          createdAt: '2024-01-01',
          lastLogin: new Date().toISOString()
        },
        {
          id: 2,
          username: 'player123',
          email: 'player@example.com',
          role: 'user',
          vipStatus: true,
          totalSpent: 49.99,
          createdAt: '2024-02-15',
          lastLogin: '2024-03-10'
        },
        {
          id: 3,
          username: 'rustfan',
          email: 'fan@example.com',
          role: 'user',
          vipStatus: false,
          totalSpent: 12.99,
          createdAt: '2024-03-01',
          lastLogin: '2024-03-09'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading mb-8">User Management</h1>

      {/* Filters */}
      <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Role Filter</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-colors">
              + Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/20">
            <tr>
              <th className="text-left p-4 text-heading font-semibold">User</th>
              <th className="text-left p-4 text-heading font-semibold">Role</th>
              <th className="text-left p-4 text-heading font-semibold">Status</th>
              <th className="text-left p-4 text-heading font-semibold">Total Spent</th>
              <th className="text-left p-4 text-heading font-semibold">Last Login</th>
              <th className="text-left p-4 text-heading font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t border-white/10">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-heading">{user.username}</div>
                    <div className="text-sm text-muted">{user.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  {user.vipStatus && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                      VIP
                    </span>
                  )}
                </td>
                <td className="p-4 text-body">
                  ${user.totalSpent.toFixed(2)}
                </td>
                <td className="p-4 text-body">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-blue-400 hover:text-blue-300">
                      ✏️
                    </button>
                    <button className="p-1 text-red-400 hover:text-red-300">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}