import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, fullName, role);
    
    if (!error) {
      // Success message will be shown via toast
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <div className="space-y-3">
            <Label>I am a:</Label>
            <RadioGroup value={role} onValueChange={(value: 'patient' | 'doctor') => setRole(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient">Patient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="doctor" id="doctor" />
                <Label htmlFor="doctor">Doctor</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}