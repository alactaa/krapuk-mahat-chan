import { useState } from 'react'
import PickScreen from './screens/PickScreen'
import MainScreen from './screens/MainScreen'

export default function App() {
  const [activeKid, setActiveKid] = useState(null)

  if (activeKid) {
    return <MainScreen kid={activeKid} onBack={() => setActiveKid(null)} />
  }
  return <PickScreen onPick={setActiveKid} />
}
