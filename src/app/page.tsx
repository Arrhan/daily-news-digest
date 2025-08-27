"use client"
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')  
  const [interests, setInterests] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // Stops normal form submission
    // Convert comma-separated interests to array
    const interestsArray = interests.split(',').map(item => item.trim())
    // Create JSON object
    const formData = {
      email: email,
      name: name, 
      interests: interestsArray
    }
    // Send to your API
    const response = await fetch('/api/add-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    const result = await response.json()
    const messageDiv = document.getElementById('message')
    if (result.success) {
      messageDiv.innerHTML = '<p style="color: green;">User added successfully!</p>'
    } else {
      messageDiv.innerHTML = '<p style="color: red;">Error: ' + result.error + '</p>'
    }
  }
  return (
    <div style={{ 
    backgroundColor: 'white', 
    padding: '20px', 
    fontFamily: 'Arial, sans-serif' 
  }}>
    <form onSubmit={handleSubmit} style={{ 
      maxWidth: '400px', 
      margin: '0 auto' 
    }}>
      <input name="email" style={{ marginBottom: '15px',border: '1px solid #ccc' }} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input name="name" style={{ marginBottom: '15px', marginLeft: '5px',border: '1px solid #ccc' }} type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input name="interests" style={{ marginBottom: '15px',width: '100%',border: '1px solid #ccc' }} type="text" placeholder="Interests (comma-separated)" value={interests} onChange={(e) => setInterests(e.target.value)} required />
      <button type="submit" style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#007cba', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer'
        }}>Submit</button>
    </form>
    <div id="message" style={{ 
      marginTop: '20px', 
      textAlign: 'center',
      fontSize: '16px'
    }}></div>
    </div>
  );
}
