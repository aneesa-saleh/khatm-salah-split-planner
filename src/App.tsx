import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex h-screen w-screen items-center justify-center bg-pink-300">
        <h1>Khatm by Salah Planner</h1>
      </div>
    </>
  )
}

export default App
