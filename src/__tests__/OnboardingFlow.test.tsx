import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { loginUser } from '../utils/api';

// Mocks
vi.mock('../utils/audio', () => ({
  playSound: vi.fn(),
}));

vi.mock('../utils/api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe('OnboardingFlow', () => {
  it('renders welcome screen initially', () => {
    render(<OnboardingFlow onComplete={vi.fn()} onLoginExisting={vi.fn()} />);
    expect(screen.getByText(/La façon gratuite, amusante et efficace d'apprendre/i)).toBeInTheDocument();
  });

  it('allows user to navigate to login', () => {
    render(<OnboardingFlow onComplete={vi.fn()} onLoginExisting={vi.fn()} />);
    fireEvent.click(screen.getByText("J'AI DÉJÀ UN COMPTE"));
    expect(screen.getByText('Connexion')).toBeInTheDocument();
  });

  it('handles valid admin login correctly', async () => {
    const handleLogin = vi.fn();
    (loginUser as any).mockResolvedValueOnce({
      profile: { isAdmin: true, email: 'admin' },
      token: 'fake-token'
    });
    
    render(<OnboardingFlow onComplete={vi.fn()} onLoginExisting={handleLogin} />);
    
    // Go to login
    fireEvent.click(screen.getByText("J'AI DÉJÀ UN COMPTE"));
    
    // Fill credentials
    const emailInput = screen.getByPlaceholderText(/alex@exemple.fr ou Alex/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    
    fireEvent.change(emailInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'lingoquest' } });
    
    // Submit
    fireEvent.click(screen.getByText(/Se connecter/i));
    
    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true, email: 'admin' }),
        'fake-token'
      );
    });
  });
  
  it('rejects invalid admin login', async () => {
    const handleLogin = vi.fn();
    (loginUser as any).mockRejectedValueOnce(new Error('Identifiants incorrects.'));
    
    render(<OnboardingFlow onComplete={vi.fn()} onLoginExisting={handleLogin} />);
    
    fireEvent.click(screen.getByText("J'AI DÉJÀ UN COMPTE"));
    
    const emailInput = screen.getByPlaceholderText(/alex@exemple.fr ou Alex/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    
    fireEvent.change(emailInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    fireEvent.click(screen.getByText(/Se connecter/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Identifiants incorrects/i)).toBeInTheDocument();
      expect(handleLogin).not.toHaveBeenCalled();
    });
  });
});
