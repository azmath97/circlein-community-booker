'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAmenities, getBookingRules } from '@/lib/database';
import { Amenity, BookingRules } from '@/lib/types';
import { SessionUser } from '@/types/next-auth';
import { Settings, Key, BarChart3, ArrowLeft, Plus, Save, Edit, Trash2, Building } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookingRules, setBookingRules] = useState<BookingRules | null>(null);
  const [accessCodes, setAccessCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [isSavingAmenity, setIsSavingAmenity] = useState(false);
  const [isDeletingAmenity, setIsDeletingAmenity] = useState<string | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [newAmenity, setNewAmenity] = useState({
    name: '',
    description: '',
    maxCapacity: 1,
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    if ((session.user as SessionUser)?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      const [amenitiesData, rulesData] = await Promise.all([
        getAmenities(),
        getBookingRules(),
      ]);
      
      setAmenities(amenitiesData);
      setBookingRules(rulesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAccessCodes = async () => {
    setIsGeneratingCodes(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ count: 10 }),
      });

      const data = await response.json();

      if (data.success) {
        setAccessCodes(data.data.codes);
        setSuccess('Access codes generated successfully');
      } else {
        setError(data.error || 'Failed to generate codes');
      }
    } catch (err) {
      console.error('Error generating codes:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const saveBookingRules = async () => {
    if (!bookingRules) return;

    setIsSavingRules(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/update-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingRules),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Booking rules updated successfully');
      } else {
        setError(data.error || 'Failed to update rules');
      }
    } catch (err) {
      console.error('Error saving rules:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSavingRules(false);
    }
  };

  const handleRuleChange = (field: keyof BookingRules, value: number) => {
    if (bookingRules) {
      setBookingRules({
        ...bookingRules,
        [field]: value,
      });
    }
  };

  const handleAddAmenity = async () => {
    if (!newAmenity.name.trim()) {
      setError('Amenity name is required');
      return;
    }

    setIsSavingAmenity(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/amenities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAmenity),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Amenity added successfully');
        setNewAmenity({
          name: '',
          description: '',
          maxCapacity: 1,
          isActive: true,
        });
        loadData(); // Reload amenities
      } else {
        setError(data.error || 'Failed to add amenity');
      }
    } catch (err) {
      console.error('Error adding amenity:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSavingAmenity(false);
    }
  };

  const handleUpdateAmenity = async () => {
    if (!editingAmenity) return;

    setIsSavingAmenity(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/amenities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAmenity),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Amenity updated successfully');
        setEditingAmenity(null);
        loadData(); // Reload amenities
      } else {
        setError(data.error || 'Failed to update amenity');
      }
    } catch (err) {
      console.error('Error updating amenity:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSavingAmenity(false);
    }
  };

  const handleDeleteAmenity = async (amenityId: string) => {
    setIsDeletingAmenity(amenityId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/amenities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: amenityId,
          name: amenities.find(a => a.id === amenityId)?.name || '',
          description: amenities.find(a => a.id === amenityId)?.description || '',
          maxCapacity: amenities.find(a => a.id === amenityId)?.maxCapacity || 1,
          isActive: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Amenity deactivated successfully');
        loadData(); // Reload amenities
      } else {
        setError(data.error || 'Failed to deactivate amenity');
      }
    } catch (err) {
      console.error('Error deactivating amenity:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsDeletingAmenity(null);
    }
  };

  const handleToggleAmenityStatus = async (amenityId: string, newStatus: boolean) => {
    setError('');
    setSuccess('');

    const amenity = amenities.find(a => a.id === amenityId);
    if (!amenity) return;

    try {
      const response = await fetch('/api/admin/amenities', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: amenityId,
          name: amenity.name,
          description: amenity.description,
          maxCapacity: amenity.maxCapacity,
          isActive: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Amenity ${newStatus ? 'activated' : 'deactivated'} successfully`);
        loadData(); // Reload amenities
      } else {
        setError(data.error || 'Failed to update amenity status');
      }
    } catch (err) {
      console.error('Error updating amenity status:', err);
      setError('An error occurred. Please try again.');
    }
  };



  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Settings className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="access-codes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="booking-rules">Booking Rules</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          {/* Access Codes Tab */}
          <TabsContent value="access-codes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Access Code Management
                </CardTitle>
                <CardDescription>
                  Generate new access codes for resident registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateAccessCodes} disabled={isGeneratingCodes}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isGeneratingCodes ? 'Generating...' : 'Generate 10 New Codes'}
                </Button>

                {accessCodes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Generated Access Codes:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {accessCodes.map((code, index) => (
                        <Badge key={index} variant="outline" className="p-2 text-center">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-6">
            {/* Add New Amenity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Add New Amenity
                </CardTitle>
                <CardDescription>
                  Create a new amenity for residents to book
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amenityName">Amenity Name</Label>
                    <Input
                      id="amenityName"
                      value={newAmenity.name}
                      onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                      placeholder="e.g., Tennis Court"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amenityCapacity">Max Capacity</Label>
                    <Input
                      id="amenityCapacity"
                      type="number"
                      value={newAmenity.maxCapacity}
                      onChange={(e) => setNewAmenity({ ...newAmenity, maxCapacity: parseInt(e.target.value) || 1 })}
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amenityDescription">Description</Label>
                  <Input
                    id="amenityDescription"
                    value={newAmenity.description}
                    onChange={(e) => setNewAmenity({ ...newAmenity, description: e.target.value })}
                    placeholder="Brief description of the amenity"
                  />
                </div>
                <Button onClick={handleAddAmenity} disabled={isSavingAmenity}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isSavingAmenity ? 'Adding...' : 'Add Amenity'}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Amenities</CardTitle>
                <CardDescription>
                  Edit or remove existing amenities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      {editingAmenity?.id === amenity.id ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 mr-4">
                          <Input
                            value={editingAmenity.name}
                            onChange={(e) => setEditingAmenity({ ...editingAmenity, name: e.target.value })}
                            placeholder="Amenity name"
                          />
                          <Input
                            value={editingAmenity.description || ''}
                            onChange={(e) => setEditingAmenity({ ...editingAmenity, description: e.target.value })}
                            placeholder="Description"
                          />
                          <Input
                            type="number"
                            value={editingAmenity.maxCapacity}
                            onChange={(e) => setEditingAmenity({ ...editingAmenity, maxCapacity: parseInt(e.target.value) || 1 })}
                            min="1"
                            max="200"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-medium">{amenity.name}</h3>
                          <p className="text-sm text-gray-500">
                            {amenity.description} • Max Capacity: {amenity.maxCapacity}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAmenityStatus(amenity.id, !amenity.isActive)}
                        >
                          <Badge variant={amenity.isActive ? 'default' : 'secondary'}>
                            {amenity.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Button>
                        
                        {editingAmenity?.id === amenity.id ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleUpdateAmenity}
                              disabled={isSavingAmenity}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAmenity(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAmenity(amenity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isDeletingAmenity === amenity.id}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Amenity</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to deactivate &quot;{amenity.name}&quot;? This will make it unavailable for new bookings, but existing bookings will remain intact.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {}}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteAmenity(amenity.id)}
                                    disabled={isDeletingAmenity === amenity.id}
                                  >
                                    {isDeletingAmenity === amenity.id ? 'Deactivating...' : 'Deactivate'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {amenities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No amenities found. Add your first amenity above.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Rules Tab */}
          <TabsContent value="booking-rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Rules Configuration</CardTitle>
                <CardDescription>
                  Set rules and limits for amenity bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {bookingRules && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxPerFamily">Max Bookings Per Family (per day)</Label>
                      <Input
                        id="maxPerFamily"
                        type="number"
                        value={bookingRules.maxPerFamily}
                        onChange={(e) => handleRuleChange('maxPerFamily', parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAdvanceBookingDays">Max Advance Booking Days</Label>
                      <Input
                        id="maxAdvanceBookingDays"
                        type="number"
                        value={bookingRules.maxAdvanceBookingDays}
                        onChange={(e) => handleRuleChange('maxAdvanceBookingDays', parseInt(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minBookingDuration">Min Booking Duration (minutes)</Label>
                      <Input
                        id="minBookingDuration"
                        type="number"
                        value={bookingRules.minBookingDuration}
                        onChange={(e) => handleRuleChange('minBookingDuration', parseInt(e.target.value))}
                        min="15"
                        max="60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxBookingDuration">Max Booking Duration (minutes)</Label>
                      <Input
                        id="maxBookingDuration"
                        type="number"
                        value={bookingRules.maxBookingDuration}
                        onChange={(e) => handleRuleChange('maxBookingDuration', parseInt(e.target.value))}
                        min="30"
                        max="480"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancellationDeadline">Cancellation Deadline (hours before)</Label>
                      <Input
                        id="cancellationDeadline"
                        type="number"
                        value={bookingRules.cancellationDeadline}
                        onChange={(e) => handleRuleChange('cancellationDeadline', parseInt(e.target.value))}
                        min="1"
                        max="24"
                      />
                    </div>
                  </div>
                )}

                <Button onClick={saveBookingRules} disabled={isSavingRules}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSavingRules ? 'Saving...' : 'Save Rules'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Usage Statistics
                </CardTitle>
                <CardDescription>
                  View amenity usage and booking statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium">{amenity.name}</h3>
                      <p className="text-sm text-gray-500">Max Capacity: {amenity.maxCapacity}</p>
                      <Badge variant={amenity.isActive ? 'default' : 'secondary'}>
                        {amenity.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Messages */}
        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}