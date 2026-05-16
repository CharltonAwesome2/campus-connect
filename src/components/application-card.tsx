import { Calendar, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Application } from '../data/mock-data';

interface ApplicationCardProps {
  application: Application;
  showActions?: boolean;
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
}

export function ApplicationCard({ 
  application, 
  showActions = false,
  onApprove,
  onReject 
}: ApplicationCardProps) {
  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-700 border-green-200',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-700 border-red-200',
          label: 'Rejected'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          label: 'Pending'
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{application.residenceName}</h3>
            {showActions && (
              <p className="text-sm text-gray-600 mt-1">{application.studentName}</p>
            )}
          </div>
          <Badge variant="outline" className={statusConfig.color}>
            <span className="flex items-center gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {showActions && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{application.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{application.phone}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
          </div>
        </div>

        {showActions && application.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onApprove?.(application.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onReject?.(application.id)}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
