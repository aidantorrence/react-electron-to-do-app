import { useState } from 'react';
import './App.css';

export default function App() {
  const [inputValue, setInputValue] = useState(
    `set up electron app <=> set up nextJS portfolio <=> reddit board that shows top to-dos linked to their site of choice (rewards good to do ers with a link to their website of choice)`
  );
  return (
    <div className="main">
      <textarea
        className="text-area"
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        spellCheck="false"
      />
    </div>
  );
}
