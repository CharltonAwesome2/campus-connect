import { GraduationCap, Building2, User, Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Browse available residences and track your applications',
      icon: User,
      color: 'bg-blue-600',
      path: '/student'
    },
    {
      id: 'landlord',
      title: 'Landlord Dashboard',
      description: 'Manage properties and review student applications',
      icon: Building2,
      color: 'bg-indigo-600',
      path: '/landlord'
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Oversee the entire residence management system',
      icon: Shield,
      color: 'bg-purple-600',
      path: '/admin'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl mb-6">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CampusConnect Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connecting South African students with quality accommodation - improving transparency, fairness, and efficiency in student residence allocation
          </p>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Select Your Role
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className={`${role.color} p-3 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {role.title}
                    </h3>
                    <p className="text-gray-600 mb-6 min-h-[48px]">
                      {role.description}
                    </p>
                    <Button
                      className={`w-full ${role.color} hover:opacity-90`}
                      onClick={() => navigate(role.path)}
                    >
                      Enter Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckIcon />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Transparency</h4>
              <p className="text-sm text-gray-600">
                Clear visibility into available residences and application status
              </p>
            </div>
            <div>
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <BalanceIcon />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fairness</h4>
              <p className="text-sm text-gray-600">
                Equitable allocation process for all students
              </p>
            </div>
            <div>
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <SpeedIcon />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Efficiency</h4>
              <p className="text-sm text-gray-600">
                Streamlined application and approval workflow
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
