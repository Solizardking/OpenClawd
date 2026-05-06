// ═══════════════════════════════════════════════════════════════════════════════
// DARK RALPH TUI - Theme System (Bloomberg/Hacker Style)
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  textDim: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  background: string;
  backgroundAlt: string;
}

export interface Theme {
  name: string;
  colors: ColorPalette;
  borderStyle: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic';
  icons: {
    success: string;
    error: string;
    warning: string;
    info: string;
    loading: string;
    arrow: {
      up: string;
      down: string;
      left: string;
      right: string;
    };
    bullet: string;
    check: string;
    cross: string;
    star: string;
  };
  charts: {
    upColor: string;
    downColor: string;
    neutralColor: string;
    gridColor: string;
    candleUp: string;
    candleDown: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DARK RALPH THEME (Default - Hacker/Matrix style)
// ─────────────────────────────────────────────────────────────────────────────

export const darkRalphTheme: Theme = {
  name: 'Dark Ralph',
  colors: {
    primary: 'green',
    secondary: 'cyan',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    text: 'white',
    textDim: 'gray',
    textMuted: 'gray',
    border: 'green',
    borderFocus: 'greenBright',
    background: 'black',
    backgroundAlt: 'gray',
  },
  borderStyle: 'single',
  icons: {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    loading: '◌',
    arrow: {
      up: '▲',
      down: '▼',
      left: '◄',
      right: '►',
    },
    bullet: '•',
    check: '✓',
    cross: '✗',
    star: '★',
  },
  charts: {
    upColor: 'green',
    downColor: 'red',
    neutralColor: 'yellow',
    gridColor: 'gray',
    candleUp: '█',
    candleDown: '▒',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOOMBERG THEME (Classic Bloomberg Terminal)
// ─────────────────────────────────────────────────────────────────────────────

export const bloombergTheme: Theme = {
  name: 'Bloomberg',
  colors: {
    primary: 'yellow',
    secondary: 'white',
    accent: 'magenta',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    text: 'yellow',
    textDim: 'gray',
    textMuted: 'gray',
    border: 'yellow',
    borderFocus: 'yellowBright',
    background: 'black',
    backgroundAlt: 'gray',
  },
  borderStyle: 'double',
  icons: {
    success: '+',
    error: '-',
    warning: '!',
    info: '*',
    loading: '.',
    arrow: {
      up: '^',
      down: 'v',
      left: '<',
      right: '>',
    },
    bullet: '-',
    check: '+',
    cross: '-',
    star: '*',
  },
  charts: {
    upColor: 'green',
    downColor: 'red',
    neutralColor: 'white',
    gridColor: 'gray',
    candleUp: '#',
    candleDown: '=',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CYBERPUNK THEME
// ─────────────────────────────────────────────────────────────────────────────

export const cyberpunkTheme: Theme = {
  name: 'Cyberpunk',
  colors: {
    primary: 'magenta',
    secondary: 'cyan',
    accent: 'yellow',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    text: 'white',
    textDim: 'gray',
    textMuted: 'gray',
    border: 'magenta',
    borderFocus: 'magentaBright',
    background: 'black',
    backgroundAlt: 'gray',
  },
  borderStyle: 'bold',
  icons: {
    success: '◆',
    error: '◇',
    warning: '◈',
    info: '◉',
    loading: '◎',
    arrow: {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
    },
    bullet: '›',
    check: '◆',
    cross: '◇',
    star: '✦',
  },
  charts: {
    upColor: 'cyan',
    downColor: 'magenta',
    neutralColor: 'yellow',
    gridColor: 'gray',
    candleUp: '▓',
    candleDown: '░',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MINIMAL THEME
// ─────────────────────────────────────────────────────────────────────────────

export const minimalTheme: Theme = {
  name: 'Minimal',
  colors: {
    primary: 'white',
    secondary: 'gray',
    accent: 'cyan',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    text: 'white',
    textDim: 'gray',
    textMuted: 'gray',
    border: 'gray',
    borderFocus: 'white',
    background: 'black',
    backgroundAlt: 'gray',
  },
  borderStyle: 'round',
  icons: {
    success: '●',
    error: '○',
    warning: '◐',
    info: '◑',
    loading: '◒',
    arrow: {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→',
    },
    bullet: '·',
    check: '●',
    cross: '○',
    star: '◆',
  },
  charts: {
    upColor: 'white',
    downColor: 'gray',
    neutralColor: 'gray',
    gridColor: 'gray',
    candleUp: '│',
    candleDown: '┊',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SOLANA THEME
// ─────────────────────────────────────────────────────────────────────────────

export const solanaTheme: Theme = {
  name: 'Solana',
  colors: {
    primary: 'magenta',
    secondary: 'cyan',
    accent: 'green',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'cyan',
    text: 'white',
    textDim: 'gray',
    textMuted: 'gray',
    border: 'magenta',
    borderFocus: 'cyan',
    background: 'black',
    backgroundAlt: 'gray',
  },
  borderStyle: 'single',
  icons: {
    success: '◉',
    error: '◎',
    warning: '◐',
    info: '◑',
    loading: '◌',
    arrow: {
      up: '▴',
      down: '▾',
      left: '◂',
      right: '▸',
    },
    bullet: '◦',
    check: '◉',
    cross: '◎',
    star: '✧',
  },
  charts: {
    upColor: 'green',
    downColor: 'red',
    neutralColor: 'cyan',
    gridColor: 'gray',
    candleUp: '█',
    candleDown: '▒',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const themes: Record<string, Theme> = {
  'dark-ralph': darkRalphTheme,
  bloomberg: bloombergTheme,
  cyberpunk: cyberpunkTheme,
  minimal: minimalTheme,
  solana: solanaTheme,
};

export const defaultTheme = darkRalphTheme;

// ─────────────────────────────────────────────────────────────────────────────
// THEME HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function getTheme(name: string): Theme {
  return themes[name] || defaultTheme;
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

// ─────────────────────────────────────────────────────────────────────────────
// ASCII ART ELEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const ASCII_BORDERS = {
  single: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    teeLeft: '├',
    teeRight: '┤',
    teeTop: '┬',
    teeBottom: '┴',
    cross: '┼',
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
    teeLeft: '╠',
    teeRight: '╣',
    teeTop: '╦',
    teeBottom: '╩',
    cross: '╬',
  },
  bold: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃',
    teeLeft: '┣',
    teeRight: '┫',
    teeTop: '┳',
    teeBottom: '┻',
    cross: '╋',
  },
  round: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    teeLeft: '├',
    teeRight: '┤',
    teeTop: '┬',
    teeBottom: '┴',
    cross: '┼',
  },
};

export const ASCII_PROGRESS = {
  filled: ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'],
  blocks: ['░', '▒', '▓', '█'],
  dots: ['⣀', '⣄', '⣤', '⣦', '⣶', '⣷', '⣿'],
  bars: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],
};

export const ASCII_SPINNERS = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['-', '\\', '|', '/'],
  circle: ['◐', '◓', '◑', '◒'],
  square: ['◰', '◳', '◲', '◱'],
  bounce: ['⠁', '⠂', '⠄', '⠂'],
  pulse: ['◯', '◔', '◑', '◕', '●', '◕', '◑', '◔'],
};

// ─────────────────────────────────────────────────────────────────────────────
// CHART CHARACTERS
// ─────────────────────────────────────────────────────────────────────────────

export const CHART_CHARS = {
  sparkline: '▁▂▃▄▅▆▇█',
  braille: {
    empty: '⠀',
    dots: ['⠁', '⠂', '⠄', '⡀', '⠈', '⠐', '⠠', '⢀'],
  },
  box: {
    light: '░',
    medium: '▒',
    dark: '▓',
    full: '█',
    empty: ' ',
  },
  candle: {
    body: {
      up: '█',
      down: '▒',
      doji: '│',
    },
    wick: '│',
  },
};

export default themes;
