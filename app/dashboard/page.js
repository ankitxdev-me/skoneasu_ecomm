'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Header from '@/components/Header'
import { toast } from 'sonner'
import { Loader2, Package, Heart, LogOut, MapPin, Lock, User, Plus, Trash2, Edit2 } from 'lucide-react'
import { addressAPI } from '@/lib/api'

export default function DashboardPage() {
    const router = useRouter()
    const { user, profile, loading, updateProfile, updatePassword, signOut } = useAuth()

    const [activeTab, setActiveTab] = useState('profile') // 'profile', 'addresses', 'security'

    // Profile Form State
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
    })
    const [savingProfile, setSavingProfile] = useState(false)

    // Address State
    const [addresses, setAddresses] = useState([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)

    // New Address Form State
    const [addressForm, setAddressForm] = useState({
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false
    })
    const [savingAddress, setSavingAddress] = useState(false)

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        confirmPassword: ''
    })
    const [changingPassword, setChangingPassword] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/signin')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (profile) {
            setProfileData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
            })
        }
    }, [profile])

    // Load addresses when tab is active
    useEffect(() => {
        if (activeTab === 'addresses' && user) {
            fetchAddresses()
        }
    }, [activeTab, user])

    const fetchAddresses = async () => {
        setLoadingAddresses(true)
        try {
            const data = await addressAPI.getAll()
            setAddresses(data || [])
        } catch (error) {
            toast.error('Failed to load addresses')
        } finally {
            setLoadingAddresses(false)
        }
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setSavingProfile(true)
        try {
            await updateProfile(profileData)
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error('Failed to update profile')
            console.error(error)
        } finally {
            setSavingProfile(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (passwordForm.password !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (passwordForm.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setChangingPassword(true)
        try {
            await updatePassword(passwordForm.password)
            toast.success('Password updated successfully')
            setPasswordForm({ password: '', confirmPassword: '' })
        } catch (error) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            setChangingPassword(false)
        }
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()
        setSavingAddress(true)
        try {
            if (editingAddress) {
                await addressAPI.update(editingAddress.id, addressForm)
                toast.success('Address updated')
            } else {
                await addressAPI.create(addressForm)
                toast.success('Address added')
            }
            setShowAddressForm(false)
            setEditingAddress(null)
            setAddressForm({
                full_name: '', address_line1: '', address_line2: '',
                city: '', state: '', postal_code: '', country: 'India', phone: '', is_default: false
            })
            fetchAddresses()
        } catch (error) {
            toast.error('Failed to save address')
        } finally {
            setSavingAddress(false)
        }
    }

    const handleDeleteAddress = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return
        try {
            await addressAPI.delete(id)
            toast.success('Address deleted')
            fetchAddresses()
        } catch (error) {
            toast.error('Failed to delete address')
        }
    }

    const startEditAddress = (addr) => {
        setEditingAddress(addr)
        setAddressForm(addr)
        setShowAddressForm(true)
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Account</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="space-y-2">
                        <Button
                            variant={activeTab === 'profile' ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === 'profile' ? 'bg-neutral-900 text-white hover:bg-neutral-800' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Profile Settings
                        </Button>
                        <Button
                            variant={activeTab === 'addresses' ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === 'addresses' ? 'bg-neutral-900 text-white hover:bg-neutral-800' : ''}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            Addresses
                        </Button>
                        <Button
                            variant={activeTab === 'security' ? "default" : "ghost"}
                            className={`w-full justify-start ${activeTab === 'security' ? 'bg-neutral-900 text-white hover:bg-neutral-800' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            Security
                        </Button>

                        <div className="pt-4 border-t border-neutral-200 mt-4">
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/orders">
                                    <Package className="mr-2 h-4 w-4" />
                                    My Orders
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start" asChild>
                                <Link href="/wishlist">
                                    <Heart className="mr-2 h-4 w-4" />
                                    Wishlist
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={signOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>Update your personal information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <Input value={user.email} disabled className="bg-neutral-100" />
                                            <p className="text-xs text-neutral-500">Email cannot be changed</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Full Name</label>
                                            <Input
                                                value={profileData.full_name}
                                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone Number</label>
                                            <Input
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        <Button type="submit" disabled={savingProfile}>
                                            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'security' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>Update your password</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.password}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Confirm New Password</label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <Button type="submit" disabled={changingPassword}>
                                            {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* ADDRESSES TAB */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">My Addresses</h2>
                                    {!showAddressForm && (
                                        <Button onClick={() => {
                                            setEditingAddress(null)
                                            setAddressForm({
                                                full_name: '', address_line1: '', address_line2: '',
                                                city: '', state: '', postal_code: '', country: 'India', phone: '', is_default: false
                                            })
                                            setShowAddressForm(true)
                                        }}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Address
                                        </Button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Full Name</label>
                                                        <Input required value={addressForm.full_name} onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Phone</label>
                                                        <Input required value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium">Address Line 1</label>
                                                        <Input required value={addressForm.address_line1} onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium">Address Line 2 (Optional)</label>
                                                        <Input value={addressForm.address_line2} onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">City</label>
                                                        <Input required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">State</label>
                                                        <Input required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Postal Code</label>
                                                        <Input required value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Country</label>
                                                        <Input required value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="is_default"
                                                        checked={addressForm.is_default}
                                                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                                        className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                                                    />
                                                    <label htmlFor="is_default" className="text-sm font-medium">Set as default address</label>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <Button type="submit" disabled={savingAddress}>
                                                        {savingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Address
                                                    </Button>
                                                    <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {loadingAddresses ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-600" />
                                            </div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-center py-8 border rounded-lg bg-neutral-50">
                                                <p className="text-neutral-500 mb-4">No addresses saved yet</p>
                                                <Button onClick={() => setShowAddressForm(true)}>Add Your First Address</Button>
                                            </div>
                                        ) : (
                                            addresses.map((addr) => (
                                                <Card key={addr.id} className="relative group">
                                                    <CardContent className="p-6">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold">{addr.full_name}</h3>
                                                                    {addr.is_default && (
                                                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">Default</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-neutral-600">{addr.address_line1}</p>
                                                                {addr.address_line2 && <p className="text-sm text-neutral-600">{addr.address_line2}</p>}
                                                                <p className="text-sm text-neutral-600">
                                                                    {addr.city}, {addr.state} {addr.postal_code}
                                                                </p>
                                                                <p className="text-sm text-neutral-600">{addr.country}</p>
                                                                <p className="text-sm text-neutral-600 mt-2">Ph: {addr.phone}</p>
                                                            </div>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="outline" size="icon" onClick={() => startEditAddress(addr)}>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteAddress(addr.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
