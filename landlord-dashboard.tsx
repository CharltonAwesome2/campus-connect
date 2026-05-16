import { useState } from 'react';
import { Header } from '../components/header';
import { ResidenceCard } from '../components/residence-card';
import { ApplicationCard } from '../components/application-card';
import { residences, applications } from '../data/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Building2, FileText, Plus, DollarSign, Users, TrendingUp, Home } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function LandlordDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock landlord data - filter by landlord ID
  const landlordResidences = residences.filter(r => r.landlordId === 'l1');
  const landlordApplications = applications.filter(a => 
    landlordResidences.some(r => r.id === a.residenceId)
  );

  const handleApprove = (applicationId: string) => {
    const application = applications.find(a => a.id === applicationId);
    toast.success(`Application approved for ${application?.studentName}`, {
      description: 'The student has been notified.'
    });
  };

  const handleReject = (applicationId: string) => {
    const application = applications.find(a => a.id === applicationId);
    toast.error(`Application rejected for ${application?.studentName}`, {
      description: 'The student has been notified.'
    });
  };

  const handleEdit = (residenceId: string) => {
    const residence = residences.find(r => r.id === residenceId);
    toast.info(`Editing ${residence?.name}`);
  };

  const handleDelete = (residenceId: string) => {
    const residence = residences.find(r => r.id === residenceId);
    toast.success(`${residence?.name} removed from listings`);
  };

  const handleAddProperty = () => {
    toast.success('New property added successfully!');
    setIsAddDialogOpen(false);
  };

  // Calculate analytics
  const totalRooms = landlordResidences.reduce((sum, r) => sum + r.totalRooms, 0);
  const occupiedRooms = landlordResidences.reduce((sum, r) => sum + (r.totalRooms - r.availableRooms), 0);
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;
  const avgPrice = landlordResidences.length > 0
    ? (landlordResidences.reduce((sum, r) => sum + r.price, 0) / landlordResidences.length).toFixed(0)
    : 0;
  const pendingCount = landlordApplications.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header role="landlord" userName="Jane Anderson" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{landlordResidences.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-green-600">{occupancyRate}%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-indigo-600">R{Number(avgPrice).toLocaleString()}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Apps</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="properties">
              <Building2 className="w-4 h-4 mr-2" />
              My Properties
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="w-4 h-4 mr-2" />
              Applications ({pendingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Property Listings</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Property Name</Label>
                      <Input id="name" placeholder="Enter property name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Monthly Price (R)</Label>
                        <Input id="price" type="number" placeholder="4500" />
                      </div>
                      <div>
                        <Label htmlFor="distance">Distance (km)</Label>
                        <Input id="distance" type="number" placeholder="1.5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total-rooms">Total Rooms</Label>
                        <Input id="total-rooms" type="number" placeholder="30" />
                      </div>
                      <div>
                        <Label htmlFor="type">Room Type</Label>
                        <Select defaultValue="single">
                          <SelectTrigger id="type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="shared">Shared</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAddProperty}>
                      Add Property
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landlordResidences.map((residence, index) => (
                <motion.div
                  key={residence.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ResidenceCard 
                    residence={residence}
                    showActions
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {landlordApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ApplicationCard
                      application={application}
                      showActions
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  </motion.div>
                ))}
                {landlordApplications.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No applications received yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
