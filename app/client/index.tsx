import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ClientIndex() {
  useEffect(() => {
    router.replace('/client/onboarding/welcome' as never);
  }, []);

  return null;
}
