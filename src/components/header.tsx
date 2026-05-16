import { GraduationCap, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface HeaderProps {
  role: 'student' | 'landlord' | 'admin';
  userName?: string;
}

export function Header({ role, userName = 'User' }: HeaderProps) {
  const navigate = useNavigate();

  const getRoleDisplay = () => {
    switch (role) {
      case 'student':
        return 'Student Portal';
      case 'landlord':
        return 'Landlord Dashboard';
      case 'admin':
        return 'Admin Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">CampusConnect</h1>
              <p className="text-sm text-gray-500">{getRoleDisplay()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {userName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
