import { BrowserRouter as Router } from 'react-router-dom'
import { AppLayout } from './components/layout'
import { AppRoutes } from './routes'
import { ErrorBoundary } from './components/error'
import { OfflineIndicator } from './components/offline'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
        <OfflineIndicator />
        <Toaster />
      </Router>
    </ErrorBoundary>
  )
}

export default App
