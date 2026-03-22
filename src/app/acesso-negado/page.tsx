'use client'

import { useRouter } from 'next/navigation'
import { ShieldX } from 'lucide-react'

export default function AcessoNegadoPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-destructive/10">
                        <ShieldX className="w-16 h-16 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-display font-bold text-white">
                        Acesso não autorizado
                    </h1>
                    <p className="text-white/60 text-base leading-relaxed">
                        Sua conta ainda não foi ativada. Entre em contato com o administrador.
                    </p>
                </div>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                    Voltar para Login
                </button>
            </div>
        </div>
    )
}
