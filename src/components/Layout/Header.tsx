import DVRPCMini from '@/assets/dvrpc-mini.svg?react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Info } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { TOKEN_TTL_MS } from '@consts';
import AboutModal from './AboutModal';

interface GoogleProfile {
  picture: string;
  name: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const { setToken, clearToken, isAdmin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('access_token_expiry');
    return token && expiry && Date.now() < parseInt(expiry);
  };

  const getPictureUrl = (url: string) =>
    url.includes('googleusercontent.com') && !url.includes('=')
      ? `${url}=s64`
      : url;

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const logout = () => {
    clearToken();
    setProfile(null);
    setImgFailed(false);
    setDropdownOpen(false);
    setSearchParams({});
  };

  useEffect(() => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem('access_token')!;
    const decoded = jwtDecode<{ picture: string; name: string }>(token);
    setImgFailed(false);
    setProfile({
      picture: getPictureUrl(decoded.picture),
      name: decoded.name,
    });
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
    <header className="h-15 flex pl-4 pr-4 items-center gap-4 text-dvrpc-blue-3 border-b border-dvrpc-gray-7">
      <a
        href="https://www.dvrpc.org/"
        target="_blank"
        aria-label="DVRPC Main Website"
      >
        <DVRPCMini className="mt-3 md:h-12 sm:h-10 h-8 text-dvrpc-blue-3" />
      </a>
      <h1 className="md:text-3xl sm:text-2xl text-xl font-bold border-l-3 pl-4 line-clamp-1">
        Project Inventory Tool
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          title="About Project Inventory Tool"
          aria-label="About Project Inventory Tool"
          aria-haspopup="dialog"
          className="flex items-center rounded-full text-dvrpc-blue-3 hover:text-dvrpc-blue-1 transition-colors cursor-pointer"
        >
          <Info size={24} />
        </button>
        {profile ? (
          <div className="relative" ref={dropdownRef}>
            {imgFailed || !profile.picture ? (
              <div
                title={profile.name}
                onClick={() => setDropdownOpen((o) => !o)}
                className="h-8 w-8 rounded-full cursor-pointer flex items-center justify-center bg-dvrpc-blue-3 text-white text-sm font-medium select-none"
              >
                {initials}
              </div>
            ) : (
              <img
                src={profile.picture}
                alt={profile.name}
                title={profile.name}
                onClick={() => setDropdownOpen((o) => !o)}
                onError={() => setImgFailed(true)}
                className="h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-dvrpc-blue-3"
              />
            )}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-dvrpc-gray-7 rounded shadow-md z-50">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-dvrpc-gray-7 truncate">
                  {profile.name}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Admin
                  </button>
                )}
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
              setImgFailed(false);
              setProfile({
                picture: getPictureUrl(decoded.picture),
                name: decoded.name,
              });
              setSearchParams({});
            }}
            text="signin"
            onError={() => console.error('Login failed')}
          />
        )}
      </div>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </header>
  );
}
