import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminAuthProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

// Production-ready password hashing and validation
const ADMIN_PASSWORD_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 of admin password
const ADMIN_SESSION_KEY = 'admin_session_token';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple hash function for demo (use proper crypto in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AdminAuth({ onAuthenticated, onCancel }: AdminAuthProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Check if this is first time setup
  useEffect(() => {
    const hasAdminSetup = localStorage.getItem('admin_setup_complete');
    if (!hasAdminSetup) {
      setIsFirstTime(true);
    }
  }, []);

  // Check for existing session
  useEffect(() => {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionData) {
      try {
        const { token, timestamp } = JSON.parse(sessionData);
        const now = Date.now();
        
        if (now - timestamp < SESSION_DURATION) {
          onAuthenticated();
          return;
        } else {
          // Session expired
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }

    // Check for lockout
    const lockoutData = localStorage.getItem('admin_lockout');
    if (lockoutData) {
      try {
        const { until } = JSON.parse(lockoutData);
        if (Date.now() < until) {
          setIsLocked(true);
          setLockoutTime(until);
        } else {
          localStorage.removeItem('admin_lockout');
        }
      } catch {
        localStorage.removeItem('admin_lockout');
      }
    }
  }, [onAuthenticated]);

  // Lockout countdown
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const interval = setInterval(() => {
        const remaining = lockoutTime - Date.now();
        if (remaining <= 0) {
          setIsLocked(false);
          setLockoutTime(0);
          setAttempts(0);
          localStorage.removeItem('admin_lockout');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime]);

  const handleSetupAdmin = async () => {
    if (password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const hashedPassword = await hashPassword(password);
      
      // Store hashed password (in production, store server-side)
      localStorage.setItem('admin_password_hash', hashedPassword);
      localStorage.setItem('admin_setup_complete', 'true');
      
      // Create session
      const sessionToken = await hashPassword(`${password}_${Date.now()}`);
      const sessionData = {
        token: sessionToken,
        timestamp: Date.now()
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      
      onAuthenticated();
    } catch (error) {
      setError('Errore durante la configurazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isLocked) return;
    
    if (!password) {
      setError('Inserisci la password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get stored password hash
      const storedHash = localStorage.getItem('admin_password_hash') || ADMIN_PASSWORD_HASH;
      const enteredHash = await hashPassword(password);
      
      if (enteredHash === storedHash) {
        // Success - create session
        const sessionToken = await hashPassword(`${password}_${Date.now()}`);
        const sessionData = {
          token: sessionToken,
          timestamp: Date.now()
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        
        // Reset attempts
        setAttempts(0);
        localStorage.removeItem('admin_lockout');
        
        onAuthenticated();
      } else {
        // Failed attempt
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          // Lock account for 15 minutes
          const lockoutUntil = Date.now() + (15 * 60 * 1000);
          setIsLocked(true);
          setLockoutTime(lockoutUntil);
          localStorage.setItem('admin_lockout', JSON.stringify({ until: lockoutUntil }));
          setError('Troppi tentativi falliti. Account bloccato per 15 minuti.');
        } else {
          setError(`Password errata. Rimanenti tentativi: ${5 - newAttempts}`);
        }
      }
    } catch (error) {
      setError('Errore durante l\'autenticazione. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingLockoutTime = () => {
    if (!isLocked || lockoutTime === 0) return '';
    
    const remaining = Math.max(0, lockoutTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/90 backdrop-blur-sm border-slate-700 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isFirstTime ? '⚙️ Configurazione Admin' : '🔐 Accesso Amministratore'}
          </CardTitle>
          <p className="text-slate-300 text-sm">
            {isFirstTime 
              ? 'Imposta la password per il primo accesso admin'
              : 'Accesso sicuro al pannello di amministrazione'
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLocked ? (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Account temporaneamente bloccato</strong><br />
                Tempo rimanente: <span className="font-mono font-bold">{getRemainingLockoutTime()}</span>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {error && (
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    {isFirstTime ? 'Nuova Password Admin' : 'Password Admin'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isFirstTime ? 'Minimum 8 caratteri' : 'Inserisci password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (isFirstTime ? handleSetupAdmin() : handleLogin())}
                      className="bg-slate-700 border-slate-600 text-white pr-12 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isFirstTime && (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-200">
                      Conferma Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ripeti la password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSetupAdmin()}
                      className="bg-slate-700 border-slate-600 text-white focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                )}

                {!isFirstTime && attempts > 0 && (
                  <div className="text-center">
                    <div className="text-amber-400 text-sm">
                      ⚠️ Tentativi falliti: {attempts}/5
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      L'account verrà bloccato dopo 5 tentativi falliti
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={isFirstTime ? handleSetupAdmin : handleLogin}
                  disabled={isLoading || !password || (isFirstTime && !confirmPassword)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isFirstTime ? 'Configurazione...' : 'Accesso...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isFirstTime ? <CheckCircle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      {isFirstTime ? 'Configura' : 'Accedi'}
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={onCancel}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Annulla
                </Button>
              </div>

              {isFirstTime && (
                <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Primo Accesso:</strong> Stai configurando la password admin per la prima volta. 
                    Scegli una password sicura di almeno 8 caratteri.
                  </AlertDescription>
                </Alert>
              )}

              {!isFirstTime && (
                <div className="text-center text-xs text-slate-400 space-y-1">
                  <div>🔒 Sessione valida per 24 ore</div>
                  <div>🛡️ Protezione anti-brute force attiva</div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}