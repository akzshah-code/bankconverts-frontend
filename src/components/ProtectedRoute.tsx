// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`${apiUrl}/api/status`, { credentials: 'include' });
        if (!mounted) return;
        if (r.ok) setAllowed(true);
        else {
          setAllowed(false);
          navigate('/login', { replace: true });
        }
      } catch {
        if (!mounted) return;
        setAllowed(false);
        navigate('/login', { replace: true });
      }
    })();
    return () => { mounted = false; };
  }, [apiUrl, navigate]);

  if (allowed === null) return null;
  return allowed ? <>{children}</> : null;
}
