import { Animated, Easing } from 'react-native';

export const springPresets = {
  gentle: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
  bouncy: {
    tension: 50,
    friction: 5,
    useNativeDriver: true,
  },
  quick: {
    tension: 100,
    friction: 10,
    useNativeDriver: true,
  },
  snappy: {
    tension: 180,
    friction: 12,
    useNativeDriver: true,
  },
};

export const timingPresets = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

export function fadeIn(
  animatedValue: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
  });
}

export function fadeOut(
  animatedValue: Animated.Value,
  duration: number = 300
): Animated.CompositeAnimation {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
}

export function slideInFromBottom(
  animatedValue: Animated.Value,
  duration: number = 400
): Animated.CompositeAnimation {
  return Animated.spring(animatedValue, {
    toValue: 0,
    ...springPresets.quick,
  });
}

export function slideOutToBottom(
  animatedValue: Animated.Value,
  distance: number = 100
): Animated.CompositeAnimation {
  return Animated.timing(animatedValue, {
    toValue: distance,
    ...timingPresets.normal,
  });
}

export function scaleIn(
  animatedValue: Animated.Value,
  delay: number = 0
): Animated.CompositeAnimation {
  return Animated.spring(animatedValue, {
    toValue: 1,
    delay,
    ...springPresets.bouncy,
  });
}

export function scaleOut(
  animatedValue: Animated.Value
): Animated.CompositeAnimation {
  return Animated.timing(animatedValue, {
    toValue: 0,
    ...timingPresets.fast,
  });
}

export function pulse(
  animatedValue: Animated.Value,
  toValue: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
}

export function shake(
  animatedValue: Animated.Value,
  distance: number = 10
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: distance,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -distance,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: distance / 2,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -distance / 2,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
}

export function staggeredFadeIn(
  items: Animated.Value[],
  staggerDelay: number = 100
): Animated.CompositeAnimation {
  return Animated.stagger(
    staggerDelay,
    items.map((item) => fadeIn(item, 400))
  );
}

export function progressAnimation(
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = 600
): Animated.CompositeAnimation {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  });
}

export function buttonPress(
  scaleValue: Animated.Value
): {
  pressIn: Animated.CompositeAnimation;
  pressOut: Animated.CompositeAnimation;
} {
  return {
    pressIn: Animated.spring(scaleValue, {
      toValue: 0.96,
      ...springPresets.quick,
    }),
    pressOut: Animated.spring(scaleValue, {
      toValue: 1,
      ...springPresets.quick,
    }),
  };
}

export function celebrationBounce(
  animatedValue: Animated.Value
): Animated.CompositeAnimation {
  return Animated.sequence([
    Animated.spring(animatedValue, {
      toValue: 1.2,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }),
  ]);
}
