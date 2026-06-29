import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Full-screen intro overlay, shown once per browser session.
 * Mounting is guarded by sessionStorage in App.jsx — this component
 * assumes it should play; it does NOT check the flag itself.
 *
 * Timeline:
 *   0 ms      – logo springs in  (0.48 s, CSS)
 *   260 ms    – title fades in   (0.32 s, CSS)
 *   800 ms    – fade-out begins  (0.42 s CSS transition)
 *              + navigate('/login') fires simultaneously
 *              → Login's card entrance animation plays behind the fading splash
 * 1 250 ms   – transition done, onDone() unmounts us
 */
export default function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Start fade-out AND navigate at the same moment so Login's card entrance
    // plays behind the fading splash — a natural crossfade, not an abrupt cut.
    const t1 = setTimeout(() => {
      setOut(true);
      navigate('/login', { replace: true });
    }, 800);

    // After the 0.42 s CSS transition completes, let App unmount us.
    const t2 = setTimeout(onDone, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`splash${out ? ' splash--out' : ''}`} aria-hidden="true">
      <div className="splash-logo">🩸</div>
      <h1 className="splash-title">Blood Bank</h1>
    </div>
  );
}
