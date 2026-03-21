'use client'

import { useState, useEffect } from 'react'

type TestResult = {
    timestamp: string
    openai: { status: string; error: string | null; latency: number | null }
    anthropic: { status: string; error: string | null; latency: number | null }
}

export default function TestConnectionPage() {
    const [result, setResult] = useState<TestResult | null>(null)
    const [loading, setLoading] = useState(false)

    const testConnection = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/test-connection')
            const data = await res.json()
            setResult(data)
        } catch (error) {
            setResult({
                timestamp: new Date().toISOString(),
                openai: { status: 'error', error: 'Failed to fetch', latency: null },
                anthropic: { status: 'error', error: 'Failed to fetch', latency: null },
            })
        }
        setLoading(false)
    }

    useEffect(() => {
        testConnection()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-400'
            case 'error': return 'text-red-400'
            case 'missing_key': return 'text-yellow-400'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">API Connection Test</h1>
                
                <button
                    onClick={testConnection}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg mb-6 disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Again'}
                </button>

                {result && (
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-white mb-3">OpenAI</h2>
                            <p className={`text-xl font-bold ${getStatusColor(result.openai.status)}`}>
                                {result.openai.status.toUpperCase()}
                            </p>
                            {result.openai.latency && (
                                <p className="text-white/60 mt-1">Latency: {result.openai.latency}ms</p>
                            )}
                            {result.openai.error && (
                                <p className="text-red-400 mt-1 text-sm">{result.openai.error}</p>
                            )}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-white mb-3">Anthropic</h2>
                            <p className={`text-xl font-bold ${getStatusColor(result.anthropic.status)}`}>
                                {result.anthropic.status.toUpperCase()}
                            </p>
                            {result.anthropic.latency && (
                                <p className="text-white/60 mt-1">Latency: {result.anthropic.latency}ms</p>
                            )}
                            {result.anthropic.error && (
                                <p className="text-red-400 mt-1 text-sm">{result.anthropic.error}</p>
                            )}
                        </div>

                        <p className="text-white/40 text-sm">
                            Last test: {new Date(result.timestamp).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}