export const NODE_TYPES = {
  client: {
    color: '#6EE7F7',
    bg: '#0D1F2D',
    border: '#6EE7F7',
    icon: '◉',
    glow: '0 0 16px rgba(110, 231, 247, 0.5)',
  },
  gateway: {
    color: '#F7C948',
    bg: '#1F1800',
    border: '#F7C948',
    icon: '⬡',
    glow: '0 0 16px rgba(247, 201, 72, 0.5)',
  },
  service: {
    color: '#A78BFA',
    bg: '#120D1F',
    border: '#A78BFA',
    icon: '⬢',
    glow: '0 0 16px rgba(167, 139, 250, 0.5)',
  },
  cache: {
    color: '#34D399',
    bg: '#021F10',
    border: '#34D399',
    icon: '◈',
    glow: '0 0 16px rgba(52, 211, 153, 0.5)',
  },
  database: {
    color: '#F87171',
    bg: '#1F0505',
    border: '#F87171',
    icon: '⬟',
    glow: '0 0 16px rgba(248, 113, 113, 0.5)',
  },
  queue: {
    color: '#FB923C',
    bg: '#1F0A00',
    border: '#FB923C',
    icon: '⬠',
    glow: '0 0 16px rgba(251, 146, 60, 0.5)',
  },
  storage: {
    color: '#38BDF8',
    bg: '#001520',
    border: '#38BDF8',
    icon: '▣',
    glow: '0 0 16px rgba(56, 189, 248, 0.5)',
  },
  cdn: {
    color: '#E879F9',
    bg: '#1A0020',
    border: '#E879F9',
    icon: '✦',
    glow: '0 0 16px rgba(232, 121, 249, 0.5)',
  },
  monitor: {
    color: '#94A3B8',
    bg: '#0F1520',
    border: '#94A3B8',
    icon: '◎',
    glow: '0 0 16px rgba(148, 163, 184, 0.4)',
  },
};

export const EXAMPLE_PROMPTS = [
  'Design Twitter',
  'Design Netflix',
  'Design a URL Shortener',
  'Design Uber',
  'Design WhatsApp',
  'Design YouTube',
  'Design a Search Engine',
  'Design Airbnb',
];

export const getNodeStyle = (type) =>
  NODE_TYPES[type] || NODE_TYPES['service'];
