import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Apple, Mail, Lock } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showSuccess("Inscription réussie ! Vérifiez vos emails.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSuccess("Bon retour !");
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl mb-4">
            <Apple className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">iTodo</h1>
          <p className="text-gray-500 mt-2">Organisez votre vie, avec élégance.</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl text-center">{isSignUp ? 'Créer un compte' : 'Se connecter'}</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10 bg-gray-50/50 border-none h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    className="pl-10 bg-gray-50/50 border-none h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl transition-all duration-300 font-medium"
                disabled={loading}
              >
                {loading ? 'Chargement...' : isSignUp ? "S'inscrire" : 'Se connecter'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;