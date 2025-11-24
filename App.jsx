import React, { useState, useEffect } from 'react'

export default function App() {
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState('new')
  const [assessments, setAssessments] = useState([])
  
  const [property, setProperty] = useState({
    address: '',
    client: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const [rooms, setRooms] = useState([{
    name: '',
    emf: '',
    temp: ''
  }])

  const colors = {
    brown: '#3A2F2B',
    cream: '#F7F6F3',
    sage: '#9BB598'
  }

  const styles = {
    body: { minHeight: '100vh', backgroundColor: colors.cream, margin: 0, fontFamily: 'system-ui, sans-serif' },
    header: { backgroundColor: colors.brown, color: 'white', padding: '1.5rem' },
    button: { padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
    input: { width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' }
  }

  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      loadAssessments(u.email)
    }
  }, [])

  const loadAssessments = (userEmail) => {
    const all = JSON.parse(localStorage.getItem('sanctuary_assessments') || '[]')
    setAssessments(all.filter(a => a.userEmail === userEmail))
  }

  const handleAuth = (e) => {
    e.preventDefault()
    setError('')
    const users = JSON.parse(localStorage.getItem('sanctuary_users') || '[]')
    
    if (authMode === 'signup') {
      if (users.find(u => u.email === email)) {
        setError('Email already registered')
        return
      }
      const newUser = { email, password, name: name || email }
      users.push(newUser)
      localStorage.setItem('sanctuary_users', JSON.stringify(users))
      localStorage.setItem('sanctuary_user', JSON.stringify(newUser))
      setUser(newUser)
    } else {
      const found = users.find(u => u.email === email && u.password === password)
      if (!found) {
        setError('Invalid credentials')
        return
      }
      localStorage.setItem('sanctuary_user', JSON.stringify(found))
      setUser(found)
    }
  }

  const logout = () => {
    localStorage.removeItem('sanctuary_user')
    setUser(null)
    setAssessments([])
  }

  const saveAssessment = (status) => {
    const all = JSON.parse(localStorage.getItem('sanctuary_assessments') || '[]')
    all.push({
      id: Date.now(),
      status,
      property,
      rooms,
      userEmail: user.email,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('sanctuary_assessments', JSON.stringify(all))
    loadAssessments(user.email)
    alert(status === 'draft' ? 'Draft saved!' : 'Assessment completed!')
    setProperty({ address: '', client: '', date: new Date().toISOString().split('T')[0] })
    setRooms([{ name: '', emf: '', temp: '' }])
  }

  if (!user) {
    return (
      <div style={{...styles.body, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
        <div style={{maxWidth: '400px', width: '100%'}}>
          <h1 style={{textAlign: 'center', color: colors.brown, fontSize: '2.5rem', marginBottom: '2rem'}}>
            Sanctuary Certified
          </h1>
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: `4px solid ${colors.sage}`}}>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <button onClick={() => setAuthMode('login')} style={{...styles.button, flex: 1, backgroundColor: authMode === 'login' ? colors.sage : '#e5e7eb', color: authMode === 'login' ? 'white' : '#374151'}}>
                Login
              </button>
              <button onClick={() => setAuthMode('signup')} style={{...styles.button, flex: 1, backgroundColor: authMode === 'signup' ? colors.sage : '#e5e7eb', color: authMode === 'signup' ? 'white' : '#374151'}}>
                Sign Up
              </button>
            </div>
            <form onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <div style={{marginBottom: '1rem'}}>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" style={styles.input} />
                </div>
              )}
              <div style={{marginBottom: '1rem'}}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={styles.input} required />
              </div>
              <div style={{marginBottom: '1rem'}}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={styles.input} required minLength="6" />
              </div>
              {error && <p style={{color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</p>}
              <button type="submit" style={{...styles.button, width: '100%', backgroundColor: colors.sage, color: 'white'}}>
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.body}>
      <div style={styles.header}>
        <div style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 style={{fontSize: '1.5rem', margin: 0}}>Sanctuary Certified</h1>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <span style={{fontSize: '0.875rem'}}>{user.name}</span>
            <button onClick={logout} style={{...styles.button, backgroundColor: colors.sage, color: 'white', padding: '0.5rem 1rem'}}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem'}}>
        <div style={{display: 'flex', gap: '0.5rem', backgroundColor: 'white', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '2rem'}}>
          <button onClick={() => setView('new')} style={{...styles.button, flex: 1, backgroundColor: view === 'new' ? colors.sage : 'transparent', color: view === 'new' ? 'white' : '#374151'}}>
            New Assessment
          </button>
          <button onClick={() => setView('history')} style={{...styles.button, flex: 1, backgroundColor: view === 'history' ? colors.sage : 'transparent', color: view === 'history' ? 'white' : '#374151'}}>
            My Assessments ({assessments.length})
          </button>
        </div>

        {view === 'new' && (
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', borderTop: `4px solid ${colors.sage}`}}>
            <h2 style={{marginTop: 0, marginBottom: '1.5rem'}}>New Assessment</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
              <input type="text" value={property.address} onChange={(e) => setProperty({...property, address: e.target.value})} placeholder="Property Address" style={styles.input} />
              <input type="text" value={property.client} onChange={(e) => setProperty({...property, client: e.target.value})} placeholder="Client Name" style={styles.input} />
            </div>
            {rooms.map((room, i) => (
              <div key={i} style={{border: '2px solid #e5e7eb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                  <input type="text" value={room.name} onChange={(e) => { const r = [...rooms]; r[i].name = e.target.value; setRooms(r) }} placeholder="Room Name" style={styles.input} />
                  <input type="number" value={room.emf} onChange={(e) => { const r = [...rooms]; r[i].emf = e.target.value; setRooms(r) }} placeholder="EMF (mG)" style={styles.input} />
                  <input type="number" value={room.temp} onChange={(e) => { const r = [...rooms]; r[i].temp = e.target.value; setRooms(r) }} placeholder="Temp (°F)" style={styles.input} />
                </div>
              </div>
            ))}
            <button onClick={() => setRooms([...rooms, { name: '', emf: '', temp: '' }])} style={{...styles.button, width: '100%', backgroundColor: '#e5e7eb', color: '#374151', marginBottom: '1.5rem'}}>
              + Add Room
            </button>
            <div style={{display: 'flex', gap: '1rem'}}>
              <button onClick={() => saveAssessment('draft')} style={{...styles.button, flex: 1, backgroundColor: '#e5e7eb', color: '#374151'}}>
                Save Draft
              </button>
              <button onClick={() => saveAssessment('completed')} style={{...styles.button, flex: 1, backgroundColor: colors.sage, color: 'white'}}>
                Complete Assessment
              </button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', borderTop: `4px solid ${colors.sage}`}}>
            <h2 style={{marginTop: 0, marginBottom: '1.5rem'}}>Assessment History</h2>
            {assessments.length === 0 ? (
              <p style={{textAlign: 'center', color: '#6b7280', padding: '3rem 0'}}>No assessments yet</p>
            ) : (
              assessments.map(a => (
                <div key={a.id} style={{border: '2px solid #e5e7eb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                  <h3 style={{margin: '0 0 0.5rem 0'}}>{a.property.address || 'Untitled'}</h3>
                  <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280'}}>
                    {a.property.client} - {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                  <span style={{display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: a.status === 'completed' ? colors.sage : '#e5e7eb', color: a.status === 'completed' ? 'white' : '#374151'}}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
