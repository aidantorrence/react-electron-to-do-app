/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export const firstPrompt = {
  title: 'Add current task',
  label: 'Add current task',
  // title: 'What did you accomplish?',
  // label: 'What did you accomplish?',
  type: 'input' as const,
  height: 800,
  width: 800,
  alwaysOnTop: true,
  inputAttrs: { type: 'text', required: true },
};
export const secondPrompt = {
  title: 'What should you do less of?',
  label: 'What should you do less of?',
  type: 'input' as const,
  height: 800,
  width: 800,
  alwaysOnTop: true,
};
export const thirdPrompt = {
  title: 'What should you do more of?',
  label: 'What should you do more of?',
  type: 'input' as const,
  height: 800,
  width: 800,
  alwaysOnTop: true,
};
export const fourthPrompt = {
  title: 'What is your next 5 minute task?',
  label: 'What is your next 5 minute task?',
  type: 'input' as const,
  height: 800,
  width: 800,
  alwaysOnTop: true,
};
