import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { encryptData } from '../utils/security';

// Mocks
vi.mock('../utils/audio', () => ({
  playSound: vi.fn(),
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playComplete: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders OnboardingFlow by default when no profile is present', () => {
    render(<App />);
    expect(screen.getByText(/La façon gratuite, amusante et efficace d'apprendre/i)).toBeInTheDocument();
  });

  it('bypasses OnboardingFlow if valid profile exists in localStorage', () => {
    // Inject encrypted profile
    const profile = {
      id: 'test-user',
      name: 'TestUser',
      email: 'test@example.com',
      avatar: '🦊',
      targetLanguage: 'en',
      learningReason: 'Général',
      dailyGoalMinutes: 10,
      joinedDate: 'aujourdhui',
    };
    localStorage.setItem('lingoquest_profile', encryptData(profile));

    render(<App />);
    
    // The onboarding should not be in the document
    expect(screen.queryByText(/La façon gratuite, amusante et efficace d'apprendre/i)).not.toBeInTheDocument();
    
    // Instead we should see the path view (LingoQuest navbar text, etc.)
    const parcoursElements = screen.getAllByText('Parcours');
    expect(parcoursElements.length).toBeGreaterThan(0);
  });
});
