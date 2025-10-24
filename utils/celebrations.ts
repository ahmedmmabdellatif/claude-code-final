import { Animated, Platform } from 'react-native';

export type CelebrationType = 'task-complete' | 'exercise-complete' | 'workout-complete' | 'streak';

interface CelebrationOptions {
  type: CelebrationType;
  onComplete?: () => void;
}

export const showCelebration = ({ type, onComplete }: CelebrationOptions) => {
  console.log(`🎉 Celebration: ${type}`);
  
  if (Platform.OS === 'web') {
    setTimeout(() => {
      onComplete?.();
    }, 800);
    return;
  }

  const animations: Animated.CompositeAnimation[] = [];

  switch (type) {
    case 'task-complete':
      console.log('✅ Task completed! Great work!');
      break;
    case 'exercise-complete':
      console.log('💪 Exercise complete! Keep pushing!');
      break;
    case 'workout-complete':
      console.log('🏆 Workout crushed! You did amazing!');
      break;
    case 'streak':
      console.log('🔥 Streak milestone! You\'re on fire!');
      break;
  }

  if (animations.length > 0) {
    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
  } else {
    setTimeout(() => {
      onComplete?.();
    }, 800);
  }
};

export const animateCheckmark = (animatedValue: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
};

export const animateSuccess = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
) => {
  return Animated.parallel([
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }),
  ]);
};
