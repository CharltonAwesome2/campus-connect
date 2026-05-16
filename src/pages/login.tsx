import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'student' | 'landlord' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to the appropriate dashboard based on selected role
    navigate(`/${selectedRole}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#3B5998] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E4A7C] to-[#3B5998]" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1554744072-50e09710cbda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="University Building"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 flex items-center justify-center w-full px-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect Student Home
            </h1>
            <p className="text-lg text-white/90">
              Connect with trusted landlords and discover amazing student housing opportunities near your campus
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Please login to continue</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                selectedRole === 'student'
                  ? 'bg-[#4E6FDB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setSelectedRole('landlord')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                selectedRole === 'landlord'
                  ? 'bg-[#4E6FDB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Landlord
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                selectedRole === 'admin'
                  ? 'bg-[#4E6FDB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E6FDB] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E6FDB] focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#4E6FDB] border-gray-300 rounded focus:ring-[#4E6FDB]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember Me</span>
              </label>
              <a href="#" className="text-sm text-[#4E6FDB] hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4E6FDB] text-white py-3 rounded-lg font-medium hover:bg-[#3d5bc9] transition-colors"
            >
              Login to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-[#4E6FDB] hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
