import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
    return (
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <Theme>
                    <AuthProvider>
                        <Layout>
                            <Views />
                        </Layout>
                    </AuthProvider>
                </Theme>
            </QueryClientProvider>
        </BrowserRouter>
    )
}

export default App
