import { Navigate } from 'react-router-dom'
import { useAppState } from './state'
import Today from './screens/Today'

/**
 * Wat je ziet op /app. Standaard is dat Vandaag, maar je kunt onder
 * Instellingen een ander startscherm kiezen.
 */
export default function StartScreen() {
  const { startScreen } = useAppState()

  if (startScreen && startScreen !== '/app') {
    return <Navigate to={startScreen} replace />
  }

  return <Today />
}
