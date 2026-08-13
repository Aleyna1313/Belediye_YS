import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, Department } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  departments: Department[];
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDepartment: (departmentId: number, title?: "Şef" | "Teminci") => void;
  isLoading: boolean;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Bilgi İşlem Müdürlüğü', code: 'BILGI_ISLEM', description: 'Bilişim ve Teknoloji Hizmetleri', isActive: true, userCount: 4 },
  { id: 2, name: 'Kültür Sanat ve Sosyal İşler Müdürlüğü', code: 'KULTUR_SANAT', description: 'Sosyal Etkinlikler ve Kültür Merkezi', isActive: true, userCount: 3 },
  { id: 3, name: 'İnsan Kaynakları Müdürlüğü', code: 'INSAN_KAYNAKLARI', description: 'Personel ve İK Yönetimi', isActive: true, userCount: 5 },
  { id: 4, name: 'İmar ve Şehircilik Müdürlüğü', code: 'IMAR_SEHIR', description: 'Ruhsat ve Şehircilik Hizmetleri', isActive: true, userCount: 6 },
  { id: 5, name: 'Mali Hizmetler Müdürlüğü', code: 'MALI_HIZMETLER', description: 'Bütçe ve Muhasebe Yönetimi', isActive: true, userCount: 8 },
  { id: 6, name: 'Park ve Bahçeler Müdürlüğü', code: 'PARK_BAHCE', description: 'Yeşil Alanlar ve Park Bakımı', isActive: true, userCount: 5 },
  { id: 7, name: 'Hukuk İşleri Müdürlüğü', code: 'HUKUK_ISLERI', description: 'Hukuki Danışmanlık ve Davalar', isActive: true, userCount: 2 },
  { id: 8, name: 'Zabıta Müdürlüğü', code: 'ZABITA', description: 'Denetim ve Asayiş Hizmetleri', isActive: true, userCount: 12 },
  { id: 9, name: 'Afet İşleri Müdürlüğü', code: 'AFET_ISLERI', description: 'Afet Yönetimi ve Arama Kurtarma', isActive: true, userCount: 4 },
  { id: 10, name: 'Basın Yayın Müdürlüğü', code: 'BASIN_YAYIN', description: 'Halkla İlişkiler ve Basın', isActive: true, userCount: 3 }
];

const DEFAULT_USER: UserProfile = {
  id: 2,
  username: 'bilgi_sef',
  fullName: 'Ahmet Yılmaz',
  email: 'ahmet.yilmaz@belediye.bel.tr',
  phone: '0555 111 2233',
  departmentId: 1,
  departmentName: 'Bilgi İşlem Müdürlüğü',
  departmentCode: 'BILGI_ISLEM',
  title: 'Şef',
  role: 'User'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bbys_user');
    return saved ? JSON.parse(saved) as UserProfile : DEFAULT_USER;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bbys_token') || 'demo-jwt-token');
  const [departments, setDepartments] = useState<Department[]>(DEFAULT_DEPARTMENTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data && res.data.length > 0) {
        setDepartments(res.data as Department[]);
      }
    } catch {
      setDepartments(DEFAULT_DEPARTMENTS);
    }
  };

  const login = async (username: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password: password || '123456' });
      if (res.data && res.data.token) {
        setToken(res.data.token as string);
        setUser(res.data.user as UserProfile);
        localStorage.setItem('bbys_token', res.data.token as string);
        localStorage.setItem('bbys_user', JSON.stringify(res.data.user));
        setIsLoading(false);
        return true;
      }
    } catch {
      // Fallback mock login for local offline testing
      const foundDep = departments.find(d => username.toLowerCase().includes(d.code.toLowerCase())) || departments[0];
      const title: "Şef" | "Teminci" = username.toLowerCase().includes('teminci') ? 'Teminci' : 'Şef';
      const mockUser: UserProfile = {
        id: Math.floor(Math.random() * 100) + 1,
        username: username,
        fullName: `${username.replace(/_/g, ' ').toUpperCase()} (Demo)`,
        email: `${username}@belediye.bel.tr`,
        phone: '0555 000 1122',
        departmentId: foundDep.id,
        departmentName: foundDep.name,
        departmentCode: foundDep.code,
        title: title,
        role: username.includes('admin') ? 'Admin' : 'User'
      };
      setUser(mockUser);
      setToken('demo-jwt-token-' + username);
      localStorage.setItem('bbys_token', 'demo-jwt-token-' + username);
      localStorage.setItem('bbys_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bbys_token');
    localStorage.removeItem('bbys_user');
  };

  const switchDepartment = (departmentId: number, title?: "Şef" | "Teminci") => {
    const targetDep = departments.find(d => d.id === departmentId);
    if (!targetDep || !user) return;
    const newTitle = title ?? user.title;
    const updatedUser: UserProfile = {
      ...user,
      departmentId: targetDep.id,
      departmentName: targetDep.name,
      departmentCode: targetDep.code,
      title: newTitle
    };
    setUser(updatedUser);
    localStorage.setItem('bbys_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, departments, login, logout, switchDepartment, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
