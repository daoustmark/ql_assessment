import { useNavigate } from 'react-router-dom';
import { useTestSession } from '../contexts/TestSessionContext';

export const TEST_ROUTES = {
  WELCOME: '/test/welcome',
  SESSION: '/test/session',
  COMPLETE: '/test/complete',
  DAY1: {
    FOUNDATIONAL: '/test/day1/foundational',
    NEGOTIATION: '/test/day1/negotiation',
    ETHICAL: '/test/day1/ethical',
    COMPLETE: '/test/day1/complete',
  },
  DAY2: {
    SCENARIOS: '/test/day2/scenarios',
    VIDEO: '/test/day2/video',
    ETHICAL: '/test/day2/ethical',
    BEHAVIORAL: '/test/day2/behavioral',
    COMPLETE: '/test/day2/complete',
  },
} as const;

export function useTestNavigation() {
  const navigate = useNavigate();
  const { state } = useTestSession();

  const goToWelcome = () => navigate(TEST_ROUTES.WELCOME);
  const goToSession = () => navigate(TEST_ROUTES.SESSION);
  const goToComplete = () => navigate(TEST_ROUTES.COMPLETE);

  const goToDay1Section = (section: keyof typeof TEST_ROUTES.DAY1) => {
    if (state.currentDay !== 1) {
      throw new Error('Cannot navigate to Day 1 sections when not on Day 1');
    }
    navigate(TEST_ROUTES.DAY1[section]);
  };

  const goToDay2Section = (section: keyof typeof TEST_ROUTES.DAY2) => {
    if (state.currentDay !== 2) {
      throw new Error('Cannot navigate to Day 2 sections when not on Day 2');
    }
    navigate(TEST_ROUTES.DAY2[section]);
  };

  return {
    goToWelcome,
    goToSession,
    goToComplete,
    goToDay1Section,
    goToDay2Section,
  };
}

export function getNextSection(currentPath: string): string | null {
  const sections = [
    ...Object.values(TEST_ROUTES.DAY1),
    ...Object.values(TEST_ROUTES.DAY2),
  ];
  const currentIndex = sections.indexOf(currentPath);
  return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
}

export function getPreviousSection(currentPath: string): string | null {
  const sections = [
    ...Object.values(TEST_ROUTES.DAY1),
    ...Object.values(TEST_ROUTES.DAY2),
  ];
  const currentIndex = sections.indexOf(currentPath);
  return currentIndex > 0 ? sections[currentIndex - 1] : null;
} 