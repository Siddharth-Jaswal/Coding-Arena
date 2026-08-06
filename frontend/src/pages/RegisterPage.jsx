import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Forms';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';
import { Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PageWrapper withBackground>
      <Container className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
        <motion.div {...fadeSlideUp} className="w-full max-w-md">
          <Card className="border-primary/20 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.1)]">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold tracking-tighter">
                Join the Arena
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Create an account to start solving challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Username" 
                    icon={User}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    icon={Mail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>
                
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Password (min 8 characters)" 
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isRegistering}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  size="lg"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Creating Account...' : 'Register'}
                </Button>

                <div className="text-center mt-6 text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline underline-offset-4">
                    Sign in here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </PageWrapper>
  );
}
