const iconMagnet = 'assets/skill-icons/magnet.jpg';
const iconShield = 'assets/skill-icons/shield.jpg';
const iconSlow = 'assets/skill-icons/slow.jpg';
const iconSpring = 'assets/skill-icons/spring.jpg';
const iconShrink = 'assets/skill-icons/shrink.jpg';
const iconFly = 'assets/skill-icons/fly.jpg';
const iconGravity = 'assets/skill-icons/gravity.jpg';
const iconSonic = 'assets/skill-icons/sonic.jpg';
const iconLucky = 'assets/skill-icons/lucky.jpg';
const iconDouble = 'assets/skill-icons/double.jpg';
const iconInvisible = 'assets/skill-icons/invisible.jpg';
const iconSprint = 'assets/skill-icons/sprint.jpg';
const iconMultiplier = 'assets/skill-icons/multiplier.jpg';
const iconRevive = 'assets/skill-icons/revive.jpg';
const iconBurst = 'assets/skill-icons/burst.jpg';

export const SKILLS_REGISTRY = [
  {
    id: 'magnet',
    name: 'Coin Magnet',
    icon: iconMagnet,
    description: 'Pulls all nearby coins directly to your location.',
    duration: 8000,
    backgroundColor: '#3f70ab',
  },
  {
    id: 'slow',
    name: 'Time Warp',
    icon: iconSlow,
    description: 'Slows down incoming obstacles by 40%.',
    duration: 7000,
    backgroundColor: '#33b1c0',
  },
  {
    id: 'sprint',
    name: 'Super Sprint',
    icon: iconSprint,
    description: 'Maxes out run speed and grants frontal invincibility.',
    duration: 5000,
    backgroundColor: '#b63e40',
  },
  {
    id: 'shield',
    name: 'Energy Shield',
    icon: iconShield,
    description: 'Absorbs the impact of the next obstacle hit.',
    duration: 12000,
    backgroundColor: '#519558',
  },
  {
    id: 'shrink',
    name: 'Micro Form',
    icon: iconShrink,
    description: 'Shrinks you to half-size to easily slip through tight spaces.',
    duration: 8000,
    backgroundColor: '#834da1',
  },
  {
    id: 'fly',
    name: 'Rocket Jetpack',
    icon: iconFly,
    description: 'Lifts you into the sky, far above ground dangers.',
    duration: 6000,
    backgroundColor: '#da761e',
  },
  {
    id: 'gravity',
    name: 'Gravity Flip',
    icon: iconGravity,
    description: 'Inverts gravity. Tap to walk on the ceiling or ground.',
    duration: 8000,
    backgroundColor: '#394c8e',
  },
  {
    id: 'sonic',
    name: 'Sonic Pulse',
    icon: iconSonic,
    description: 'Emits shockwaves that destroy the closest obstacle in your path.',
    duration: 10000,
    backgroundColor: '#e9c437',
  },
  {
    id: 'lucky',
    name: 'Gold Rush',
    icon: iconLucky,
    description: 'Spawns clusters of bonus coins at triple the normal rate.',
    duration: 6000,
    backgroundColor: '#2a8c8b',
  },
  {
    id: 'double',
    name: 'Double Points',
    icon: iconDouble,
    description: 'Doubles all collected coins and points earned.',
    duration: 9000,
    backgroundColor: '#66a1d9',
  },
  {
    id: 'invisible',
    name: 'Ghost Walk',
    icon: iconInvisible,
    description: 'Allows you to pass safely through solid objects.',
    duration: 5000,
    backgroundColor: '#9e9e9e',
  },
  {
    id: 'spring',
    name: 'Bounce Boots',
    icon: iconSpring,
    description: 'Grants the ability to perform infinite mid-air jumps.',
    duration: 7000,
    backgroundColor: '#ba4093',
  },
  {
    id: 'multiplier',
    name: 'Score Overdrive',
    icon: iconMultiplier,
    description: 'Multiplies your passive survival score gains by 300%.',
    duration: 8000,
    backgroundColor: '#dd5231',
  },
  {
    id: 'revive',
    name: 'Second Chance',
    icon: iconRevive,
    description: 'Triggers a 3-second ghost walk upon hitting an obstacle instead of losing.',
    duration: 15000,
    backgroundColor: '#b23a3c',
  },
  {
    id: 'burst',
    name: 'Coin Burst',
    icon: iconBurst,
    description: 'Instantly explodes all screen obstacles into golden coins.',
    duration: null,
    backgroundColor: '#844ca5',
  }
];