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
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  
  const [property, setProperty] = useState({
    address: '',
    client: '',
    assessor: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  const [rooms, setRooms] = useState([{
    name: '',
    emf: '',
    rf: '',
    airQuality: '',
    radon: '',
    light: '',
    sound: '',
    temperature: '',
    humidity: '',
    energeticNotes: '',
    photos: [],
    photoNames: []
  }])

  const brand = {
    darkBrown: '#3A2F2B',
    cream: '#F7F6F3',
    sage: '#9BB598',
    copper: '#B8997A',
    gold: '#D4AF37'
  }

  const styles = {
    body: { minHeight: '100vh', backgroundColor: brand.cream, margin: 0, fontFamily: 'Georgia, serif' },
    header: { backgroundColor: brand.darkBrown, color: 'white', padding: '1.5rem', borderBottom: `4px solid ${brand.gold}` },
    button: { padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.3s' },
    input: { width: '100%', padding: '0.75rem', border: '2px solid #ddd', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.875rem', color: brand.darkBrown }
  }

  useEffect(() => {
    const saved = localStorage.getItem('sanctuary_user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      setProperty(prev => ({ ...prev, assessor: u.name }))
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
      setProperty(prev => ({ ...prev, assessor: newUser.name }))
    } else {
      const found = users.find(u => u.email === email && u.password === password)
      if (!found) {
        setError('Invalid credentials')
        return
      }
      localStorage.setItem('sanctuary_user', JSON.stringify(found))
      setUser(found)
      setProperty(prev => ({ ...prev, assessor: found.name }))
    }
  }

  const logout = () => {
    localStorage.removeItem('sanctuary_user')
    setUser(null)
    setAssessments([])
    resetForm()
  }

  const resetForm = () => {
    setProperty({ address: '', client: '', assessor: user?.name || '', date: new Date().toISOString().split('T')[0] })
    setRooms([{ name: '', emf: '', rf: '', airQuality: '', radon: '', light: '', sound: '', temperature: '', humidity: '', energeticNotes: '', photos: [], photoNames: [] }])
  }

  const addRoom = () => {
    setRooms([...rooms, { name: '', emf: '', rf: '', airQuality: '', radon: '', light: '', sound: '', temperature: '', humidity: '', energeticNotes: '', photos: [], photoNames: [] }])
  }

  const removeRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index))
  }

  const updateRoom = (index, field, value) => {
    const newRooms = [...rooms]
    newRooms[index][field] = value
    setRooms(newRooms)
  }

  const handlePhotoUpload = (index, e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const newRooms = [...rooms]
      const fileNames = files.map(f => f.name)
      newRooms[index].photoNames = [...(newRooms[index].photoNames || []), ...fileNames]
      // Simulate AI analysis
      setTimeout(() => {
        newRooms[index].aiAnalysis = `AI Analysis: ${fileNames.length} photo(s) analyzed. Visual wellness score: 8/10. Room shows good natural light and minimal clutter.`
        setRooms([...newRooms])
      }, 1500)
      setRooms(newRooms)
    }
  }

  const generateRecommendations = () => {
    const recommendations = []
    rooms.forEach((room, i) => {
      if (room.emf && parseFloat(room.emf) > 3) recommendations.push(`Room ${i + 1} (${room.name}): Reduce EMF exposure - reading is ${room.emf}mG (ideal <3mG)`)
      if (room.rf && parseFloat(room.rf) > 0.1) recommendations.push(`Room ${i + 1} (${room.name}): RF levels elevated at ${room.rf} mW/m² (ideal <0.1)`)
      if (room.radon && parseFloat(room.radon) > 2) recommendations.push(`Room ${i + 1} (${room.name}): Radon mitigation recommended - ${room.radon} pCi/L (ideal <2.0)`)
      if (room.temperature && (parseFloat(room.temperature) < 68 || parseFloat(room.temperature) > 74)) recommendations.push(`Room ${i + 1} (${room.name}): Optimize temperature - currently ${room.temperature}°F (ideal 68-74°F)`)
      if (room.humidity && (parseFloat(room.humidity) < 30 || parseFloat(room.humidity) > 50)) recommendations.push(`Room ${i + 1} (${room.name}): Adjust humidity - currently ${room.humidity}% (ideal 30-50%)`)
    })
    return recommendations.length > 0 ? recommendations : ['All measurements within optimal wellness ranges! ✓']
  }

  const saveAssessment = (status) => {
    const recommendations = generateRecommendations()
    const all = JSON.parse(localStorage.getItem('sanctuary_assessments') || '[]')
    const newAssessment = {
      id: Date.now(),
      status,
      property,
      rooms,
      recommendations,
      userEmail: user.email,
      createdAt: new Date().toISOString()
    }
    all.push(newAssessment)
    localStorage.setItem('sanctuary_assessments', JSON.stringify(all))
    loadAssessments(user.email)
    alert(`Assessment ${status === 'draft' ? 'saved as draft' : 'completed'}!\n${recommendations.length} recommendation(s) generated.`)
    resetForm()
    setView('history')
  }

  if (!user) {
    return (
      <div style={{...styles.body, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}}>
        <div style={{maxWidth: '400px', width: '100%'}}>
          <h1 style={{textAlign: 'center', color: brand.darkBrown, fontSize: '2.5rem', marginBottom: '0.5rem', fontFamily: 'Georgia, serif'}}>
            Sanctuary Certified
          </h1>
          <p style={{textAlign: 'center', color: brand.sage, fontWeight: 'bold', marginBottom: '2rem'}}>Wellness Assessment Platform</p>
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: `4px solid ${brand.sage}`}}>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <button onClick={() => setAuthMode('login')} style={{...styles.button, flex: 1, backgroundColor: authMode === 'login' ? brand.sage : '#e5e7eb', color: authMode === 'login' ? 'white' : '#374151'}}>Login</button>
              <button onClick={() => setAuthMode('signup')} style={{...styles.button, flex: 1, backgroundColor: authMode === 'signup' ? brand.sage : '#e5e7eb', color: authMode === 'signup' ? 'white' : '#374151'}}>Sign Up</button>
            </div>
            <form onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <div style={{marginBottom: '1rem'}}>
                  <label style={styles.label}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={styles.input} required />
                </div>
              )}
              <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={styles.input} required />
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label style={styles.label}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required minLength="6" />
              </div>
              {error && <p style={{color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</p>}
              <button type="submit" style={{...styles.button, width: '100%', backgroundColor: brand.sage, color: 'white'}}>
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
        <div style={{maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1 style={{fontSize: '1.75rem', margin: 0, fontFamily: 'Georgia, serif'}}>Sanctuary Certified Homes</h1>
            <p style={{margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9}}>Complete Wellness Assessment Platform</p>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <span style={{fontSize: '0.875rem'}}>{user.name}</span>
            <button onClick={logout} style={{...styles.button, backgroundColor: brand.sage, color: 'white', padding: '0.5rem 1rem'}}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1400px', margin: '2rem auto', padding: '0 1rem'}}>
        <div style={{display: 'flex', gap: '0.5rem', backgroundColor: 'white', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
          <button onClick={() => { setView('new'); setSelectedAssessment(null) }} style={{...styles.button, flex: 1, backgroundColor: view === 'new' ? brand.sage : 'transparent', color: view === 'new' ? 'white' : '#374151'}}>
            ➕ New Assessment
          </button>
          <button onClick={() => setView('history')} style={{...styles.button, flex: 1, backgroundColor: view === 'history' ? brand.sage : 'transparent', color: view === 'history' ? 'white' : '#374151'}}>
            📋 My Assessments ({assessments.length})
          </button>
        </div>

        {view === 'new' && (
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', borderTop: `4px solid ${brand.sage}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop: 0, marginBottom: '2rem', color: brand.darkBrown, fontFamily: 'Georgia, serif'}}>New Wellness Assessment</h2>
            
            {/* Property Info */}
            <div style={{marginBottom: '2rem', padding: '1.5rem', backgroundColor: brand.cream, borderRadius: '0.5rem'}}>
              <h3 style={{marginTop: 0, marginBottom: '1rem', color: brand.darkBrown}}>Property Information</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                <div>
                  <label style={styles.label}>Property Address *</label>
                  <input type="text" value={property.address} onChange={(e) => setProperty({...property, address: e.target.value})} placeholder="123 Main St, Pittsburgh, PA" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Client Name *</label>
                  <input type="text" value={property.client} onChange={(e) => setProperty({...property, client: e.target.value})} placeholder="Jane Smith" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Assessor</label>
                  <input type="text" value={property.assessor} onChange={(e) => setProperty({...property, assessor: e.target.value})} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Date</label>
                  <input type="date" value={property.date} onChange={(e) => setProperty({...property, date: e.target.value})} style={styles.input} />
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div style={{marginBottom: '2rem'}}>
              <h3 style={{marginTop: 0, marginBottom: '1rem', color: brand.darkBrown}}>Room Assessments</h3>
              {rooms.map((room, i) => (
                <div key={i} style={{border: `2px solid ${brand.cream}`, padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem', backgroundColor: 'white'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h4 style={{margin: 0, color: brand.darkBrown}}>Room {i + 1}</h4>
                    {rooms.length > 1 && (
                      <button onClick={() => removeRoom(i)} style={{...styles.button, backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem'}}>
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.label}>Room Name *</label>
                    <input type="text" value={room.name} onChange={(e) => updateRoom(i, 'name', e.target.value)} placeholder="e.g., Living Room, Master Bedroom" style={styles.input} />
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem'}}>
                    <div>
                      <label style={styles.label}>EMF (mG)</label>
                      <input type="number" step="0.1" value={room.emf} onChange={(e) => updateRoom(i, 'emf', e.target.value)} placeholder="< 3 ideal" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>RF (mW/m²)</label>
                      <input type="number" step="0.01" value={room.rf} onChange={(e) => updateRoom(i, 'rf', e.target.value)} placeholder="< 0.1 ideal" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Air Quality (AQI)</label>
                      <input type="number" value={room.airQuality} onChange={(e) => updateRoom(i, 'airQuality', e.target.value)} placeholder="0-50 good" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Radon (pCi/L)</label>
                      <input type="number" step="0.1" value={room.radon} onChange={(e) => updateRoom(i, 'radon', e.target.value)} placeholder="< 2.0 ideal" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Light (lux)</label>
                      <input type="number" value={room.light} onChange={(e) => updateRoom(i, 'light', e.target.value)} placeholder="300-500" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Sound (dB)</label>
                      <input type="number" value={room.sound} onChange={(e) => updateRoom(i, 'sound', e.target.value)} placeholder="< 40 ideal" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Temp (°F)</label>
                      <input type="number" value={room.temperature} onChange={(e) => updateRoom(i, 'temperature', e.target.value)} placeholder="68-74 ideal" style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Humidity (%)</label>
                      <input type="number" value={room.humidity} onChange={(e) => updateRoom(i, 'humidity', e.target.value)} placeholder="30-50 ideal" style={styles.input} />
                    </div>
                  </div>

                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.label}>Energetic/Atmospheric Notes</label>
                    <textarea value={room.energeticNotes} onChange={(e) => updateRoom(i, 'energeticNotes', e.target.value)} placeholder="Note the feeling, energy, flow of the space..." style={{...styles.input, minHeight: '80px', resize: 'vertical'}} />
                  </div>

                  <div style={{marginBottom: '1rem'}}>
                    <label style={styles.label}>📸 Upload Photos</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(i, e)} style={{...styles.input, padding: '0.5rem'}} />
                    {room.photoNames && room.photoNames.length > 0 && (
                      <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: brand.cream, borderRadius: '0.5rem'}}>
                        <p style={{margin: 0, fontSize: '0.875rem', fontWeight: 'bold', color: brand.darkBrown}}>
                          ✓ {room.photoNames.length} photo(s) uploaded
                        </p>
                        {room.aiAnalysis && (
                          <p style={{margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: brand.sage, fontStyle: 'italic'}}>
                            {room.aiAnalysis}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addRoom} style={{...styles.button, width: '100%', backgroundColor: brand.cream, color: brand.darkBrown, marginBottom: '2rem', border: `2px solid ${brand.sage}`}}>
              ➕ Add Another Room
            </button>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button onClick={() => saveAssessment('draft')} style={{...styles.button, flex: 1, backgroundColor: '#d1d5db', color: '#374151'}}>
                💾 Save Draft
              </button>
              <button onClick={() => saveAssessment('completed')} style={{...styles.button, flex: 1, backgroundColor: brand.sage, color: 'white', fontSize: '1.1rem'}}>
                ✓ Complete Assessment
              </button>
            </div>
          </div>
        )}

        {view === 'history' && !selectedAssessment && (
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', borderTop: `4px solid ${brand.sage}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop: 0, marginBottom: '2rem', color: brand.darkBrown, fontFamily: 'Georgia, serif'}}>Assessment History</h2>
            {assessments.length === 0 ? (
              <div style={{textAlign: 'center', padding: '4rem 0'}}>
                <p style={{fontSize: '3rem', margin: 0}}>📋</p>
                <p style={{color: '#6b7280', marginTop: '1rem'}}>No assessments yet. Create your first one!</p>
              </div>
            ) : (
              <div style={{display: 'grid', gap: '1rem'}}>
                {assessments.map(a => (
                  <div key={a.id} style={{border: `2px solid ${brand.cream}`, padding: '1.5rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.3s'}} 
                       onMouseEnter={(e) => e.currentTarget.style.borderColor = brand.sage}
                       onMouseLeave={(e) => e.currentTarget.style.borderColor = brand.cream}
                       onClick={() => setSelectedAssessment(a)}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div style={{flex: 1}}>
                        <h3 style={{margin: '0 0 0.5rem 0', color: brand.darkBrown, fontFamily: 'Georgia, serif'}}>
                          {a.property.address || 'Untitled Property'}
                        </h3>
                        <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280'}}>
                          Client: {a.property.client} | Assessor: {a.property.assessor}
                        </p>
                        <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#6b7280'}}>
                          {a.rooms.length} room(s) assessed | {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: brand.sage, fontWeight: 'bold'}}>
                          {a.recommendations?.length || 0} recommendation(s)
                        </p>
                      </div>
                      <div>
                        <span style={{display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: a.status === 'completed' ? brand.sage : brand.copper, color: 'white'}}>
                          {a.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'history' && selectedAssessment && (
          <div style={{backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', borderTop: `4px solid ${brand.sage}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
            <button onClick={() => setSelectedAssessment(null)} style={{...styles.button, backgroundColor: '#d1d5db', color: '#374151', marginBottom: '2rem'}}>
              ← Back to List
            </button>
            
            <h2 style={{marginTop: 0, marginBottom: '1rem', color: brand.darkBrown, fontFamily: 'Georgia, serif'}}>
              {selectedAssessment.property.address}
            </h2>
            <p style={{color: '#6b7280', marginBottom: '2rem'}}>
              Client: {selectedAssessment.property.client} | Date: {new Date(selectedAssessment.createdAt).toLocaleDateString()}
            </p>

            <div style={{marginBottom: '2rem', padding: '1.5rem', backgroundColor: brand.cream, borderRadius: '0.5rem'}}>
              <h3 style={{marginTop: 0, color: brand.darkBrown}}>📊 Recommendations</h3>
              {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 ? (
                <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                  {selectedAssessment.recommendations.map((rec, i) => (
                    <li key={i} style={{marginBottom: '0.5rem', color: brand.darkBrown}}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p style={{color: '#6b7280'}}>No recommendations generated</p>
              )}
            </div>

            <h3 style={{color: brand.darkBrown}}>Room Details</h3>
            {selectedAssessment.rooms.map((room, i) => (
              <div key={i} style={{border: `2px solid ${brand.cream}`, padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                <h4 style={{marginTop: 0, color: brand.darkBrown}}>{room.name || `Room ${i + 1}`}</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', fontSize: '0.875rem'}}>
                  {room.emf && <div><strong>EMF:</strong> {room.emf} mG</div>}
                  {room.rf && <div><strong>RF:</strong> {room.rf} mW/m²</div>}
                  {room.airQuality && <div><strong>Air Quality:</strong> {room.airQuality} AQI</div>}
                  {room.radon && <div><strong>Radon:</strong> {room.radon} pCi/L</div>}
                  {room.light && <div><strong>Light:</strong> {room.light} lux</div>}
                  {room.sound && <div><strong>Sound:</strong> {room.sound} dB</div>}
                  {room.temperature && <div><strong>Temp:</strong> {room.temperature}°F</div>}
                  {room.humidity && <div><strong>Humidity:</strong> {room.humidity}%</div>}
                </div>
                {room.energeticNotes && (
                  <div style={{marginTop: '1rem', padding: '0.75rem', backgroundColor: brand.cream, borderRadius: '0.5rem'}}>
                    <strong>Notes:</strong> {room.energeticNotes}
                  </div>
                )}
                {room.photoNames && room.photoNames.length > 0 && (
                  <div style={{marginTop: '1rem'}}>
                    <strong>Photos:</strong> {room.photoNames.length} uploaded
                    {room.aiAnalysis && <p style={{fontSize: '0.875rem', fontStyle: 'italic', color: brand.sage, marginTop: '0.5rem'}}>{room.aiAnalysis}</p>}
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => alert('PDF generation feature - connect to backend to enable downloads')} style={{...styles.button, width: '100%', backgroundColor: brand.sage, color: 'white', fontSize: '1.1rem'}}>
              📄 Download PDF Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
