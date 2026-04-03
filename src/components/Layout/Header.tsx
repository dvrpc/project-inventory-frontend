import DVRPCMini from '@/assets/dvrpc-mini.svg?react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../auth/AuthContext';

const TOKEN_TTL_MS = 1000 * 60 * 60;

interface GoogleProfile {
  picture: string;
  name: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [, setSearchParams] = useSearchParams();
  const { setToken, clearToken } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('access_token_expiry');
    return token && expiry && Date.now() < parseInt(expiry);
  };

  const logout = () => {
    clearToken();
    setProfile(null);
    setDropdownOpen(false);
    setSearchParams({});
  };

  useEffect(() => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem('access_token')!;
    const decoded = jwtDecode<{ picture: string; name: string }>(token);
    setProfile({ picture: decoded.picture, name: decoded.name });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-15 flex pl-8 pr-4 items-center gap-4 text-dvrpc-blue-3 border-b border-dvrpc-gray-7">
      <a
        href="https://www.dvrpc.org/"
        target="_blank"
        aria-label="DVRPC Main Website"
      >
        <DVRPCMini className="mt-3 h-12 text-dvrpc-blue-3" />
      </a>
      <h1 className="text-3xl font-bold border-l-3 pl-4">
        Project Inventory Tool
      </h1>

      <div className="ml-auto flex items-center gap-3">
        {profile ? (
          <div className="relative" ref={dropdownRef}>
            <img
              src={profile.picture}
              alt={profile.name}
              title={profile.name}
              onClick={() => setDropdownOpen((o) => !o)}
              className="h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-dvrpc-blue-3"
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-dvrpc-gray-7 rounded shadow-md z-50">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-dvrpc-gray-7 truncate">
                  {profile.name}
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Admin
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const token = credentialResponse.credential!;
              setToken(token, Date.now() + TOKEN_TTL_MS);
              const decoded = jwtDecode<{ picture: string; name: string }>(
                token
              );
              setProfile({ picture: decoded.picture, name: decoded.name });
              setSearchParams({});
            }}
            onError={() => console.error('Login failed')}
          />
        )}
      </div>
    </header>
  );
}
