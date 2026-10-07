'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Header from '@/components/Header'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { addressAPI, orderAPI, supportAPI } from '@/lib/api'
import {
  Loader2,
  Package,
  Heart,
  LogOut,
  MapPin,
  Lock,
  User,
  Plus,
  Trash2,
  Edit2,
  ShoppingCart,
  MessageSquare,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const { user, profile, loading: authLoading, updateProfile, updatePassword, signOut } = useAuth()
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  // Tab State: 'profile', 'addresses', 'security', 'orders', 'wishlist', 'tickets'
  const validTabs = ['profile', 'addresses', 'security', 'orders', 'wishlist', 'tickets']
  const initialTab = validTabs.includes(tabParam) ? tabParam : 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync tab state when URL changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    router.replace(`/dashboard?tab=${tab}`, { scroll: false })
  }

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
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    is_default: false,
  })
  const [savingAddress, setSavingAddress] = useState(false)

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // Orders State
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersFetched, setOrdersFetched] = useState(false)

  // Support Tickets State
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketsFetched, setTicketsFetched] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  // Lazy fetch addresses
  useEffect(() => {
    if (activeTab === 'addresses' && user && addresses.length === 0 && !loadingAddresses) {
      fetchAddresses()
    }
  }, [activeTab, user])

  // Lazy fetch orders
  useEffect(() => {
    if (activeTab === 'orders' && user && !ordersFetched) {
      fetchOrders()
    }
  }, [activeTab, user, ordersFetched])

  // Lazy fetch tickets
  useEffect(() => {
    if (activeTab === 'tickets' && user && !ticketsFetched) {
      fetchTickets()
    }
  }, [activeTab, user, ticketsFetched])

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

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const data = await orderAPI.getAll()
      setOrders(data || [])
      setOrdersFetched(true)
    } catch (error) {
      toast.error('Failed to load orders')
      console.error(error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const fetchTickets = async () => {
    setLoadingTickets(true)
    try {
      const data = await supportAPI.getAll()
      setTickets(data || [])
      setTicketsFetched(true)
    } catch (error) {
      console.error('Error fetching tickets via API:', error)
      try {
        if (user?.id) {
          const { data: clientData, error: clientError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          if (!clientError) {
            setTickets(clientData || [])
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr)
      }
      setTicketsFetched(true)
    } finally {
      setLoadingTickets(false)
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
        full_name: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        is_default: false,
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

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success('Added to cart')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#8C6D62]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#2D1B16]">My Account</h1>
          <p className="text-sm text-[#8C6D62] mt-1">Manage your profile, view orders, wishlist, and support tickets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation (Sticky on desktop) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E8C7AF]/60 p-3 shadow-xs md:sticky md:top-24 space-y-1">
              <div className="px-3 py-2 border-b border-[#FAF2EB] mb-1">
                <p className="text-[11px] font-semibold text-[#8C6D62] uppercase tracking-wider">Account Navigation</p>
                <p className="text-sm font-semibold text-[#2D1B16] truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </p>
              </div>

              {/* Profile Settings */}
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                    : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                }`}
                onClick={() => handleTabChange('profile')}
              >
                <User className="mr-2.5 h-4 w-4" />
                Profile Settings
              </Button>

              {/* Addresses */}
              <Button
                variant={activeTab === 'addresses' ? 'default' : 'ghost'}
                className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                  activeTab === 'addresses'
                    ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                    : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                }`}
                onClick={() => handleTabChange('addresses')}
              >
                <MapPin className="mr-2.5 h-4 w-4" />
                Addresses
              </Button>

              {/* Security */}
              <Button
                variant={activeTab === 'security' ? 'default' : 'ghost'}
                className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                  activeTab === 'security'
                    ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                    : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                }`}
                onClick={() => handleTabChange('security')}
              >
                <Lock className="mr-2.5 h-4 w-4" />
                Security
              </Button>

              <div className="pt-2 border-t border-[#FAF2EB] my-1 space-y-1">
                {/* My Orders */}
                <Button
                  variant={activeTab === 'orders' ? 'default' : 'ghost'}
                  className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                      : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                  }`}
                  onClick={() => handleTabChange('orders')}
                >
                  <Package className="mr-2.5 h-4 w-4" />
                  My Orders
                </Button>

                {/* Wishlist */}
                <Button
                  variant={activeTab === 'wishlist' ? 'default' : 'ghost'}
                  className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                      : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                  }`}
                  onClick={() => handleTabChange('wishlist')}
                >
                  <Heart className="mr-2.5 h-4 w-4" />
                  Wishlist
                  {wishlist?.length > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#2D1B16] font-semibold">
                      {wishlist.length}
                    </span>
                  )}
                </Button>

                {/* Support Tickets */}
                <Button
                  variant={activeTab === 'tickets' ? 'default' : 'ghost'}
                  className={`w-full justify-start font-medium text-xs sm:text-sm h-10 transition-colors ${
                    activeTab === 'tickets'
                      ? 'bg-[#2D1B16] text-white hover:bg-[#1A0E0A]'
                      : 'text-[#3E2923] hover:bg-[#F8EEE4] hover:text-[#2D1B16]'
                  }`}
                  onClick={() => handleTabChange('tickets')}
                >
                  <MessageSquare className="mr-2.5 h-4 w-4" />
                  Support Tickets
                  {tickets?.length > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#FAF2EB] text-[#2D1B16] font-semibold">
                      {tickets.length}
                    </span>
                  )}
                </Button>
              </div>

              <div className="pt-2 border-t border-[#FAF2EB] mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-medium text-xs sm:text-sm h-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={signOut}
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="border-[#E8C7AF]/60 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-[#2D1B16]">Profile Details</CardTitle>
                  <CardDescription className="text-neutral-500">Update your personal account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3E2923] uppercase tracking-wider">Email Address</label>
                      <Input value={user.email || ''} disabled className="bg-neutral-100 text-neutral-600 cursor-not-allowed" />
                      <p className="text-[11px] text-neutral-500">Email cannot be changed directly</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3E2923] uppercase tracking-wider">Full Name</label>
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Your full name"
                        className="border-[#E8C7AF]/80 focus:ring-[#2D1B16]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3E2923] uppercase tracking-wider">Phone Number</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Your contact number"
                        className="border-[#E8C7AF]/80 focus:ring-[#2D1B16]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A] px-6"
                    >
                      {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#2D1B16]">Saved Addresses</h2>
                    <p className="text-sm text-[#8C6D62]">Manage your delivery destinations</p>
                  </div>
                  {!showAddressForm && (
                    <Button
                      onClick={() => {
                        setEditingAddress(null)
                        setAddressForm({
                          full_name: '',
                          address_line1: '',
                          address_line2: '',
                          city: '',
                          state: '',
                          postal_code: '',
                          country: 'India',
                          phone: '',
                          is_default: false,
                        })
                        setShowAddressForm(true)
                      }}
                      className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Address
                    </Button>
                  )}
                </div>

                {showAddressForm ? (
                  <Card className="border-[#E8C7AF]/60 shadow-xs">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-[#2D1B16]">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">Full Name</label>
                            <Input
                              required
                              value={addressForm.full_name}
                              onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">Phone Number</label>
                            <Input
                              required
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-[#3E2923]">Address Line 1</label>
                            <Input
                              required
                              value={addressForm.address_line1}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-[#3E2923]">Address Line 2 (Optional)</label>
                            <Input
                              value={addressForm.address_line2}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">City</label>
                            <Input
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">State</label>
                            <Input
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">Postal Code</label>
                            <Input
                              required
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#3E2923]">Country</label>
                            <Input
                              required
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                            className="h-4 w-4 text-[#2D1B16] rounded border-gray-300 focus:ring-[#2D1B16]"
                          />
                          <label htmlFor="is_default" className="text-sm font-medium text-[#2D1B16]">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button type="submit" disabled={savingAddress} className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                            {savingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Address
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {loadingAddresses ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-7 w-7 animate-spin mx-auto text-[#8C6D62]" />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-[#E8C7AF] rounded-2xl bg-[#FAF2EB]/40">
                        <MapPin className="h-10 w-10 mx-auto text-[#8C6D62] mb-3 opacity-60" />
                        <p className="text-[#3E2923] font-medium mb-1">No addresses saved yet</p>
                        <p className="text-xs text-neutral-500 mb-4">Add your shipping address for quicker checkouts.</p>
                        <Button onClick={() => setShowAddressForm(true)} className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <Card key={addr.id} className="relative group border-[#E8C7AF]/60 shadow-xs hover:border-[#2D1B16]/30 transition-colors">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h3 className="font-semibold text-neutral-900">{addr.full_name}</h3>
                                  {addr.is_default && (
                                    <span className="bg-[#FAF2EB] text-[#2D1B16] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#E8C7AF]">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-neutral-600">{addr.address_line1}</p>
                                {addr.address_line2 && <p className="text-sm text-neutral-600">{addr.address_line2}</p>}
                                <p className="text-sm text-neutral-600">
                                  {addr.city}, {addr.state} {addr.postal_code}
                                </p>
                                <p className="text-sm text-neutral-600">{addr.country}</p>
                                <p className="text-xs text-neutral-500 mt-2 font-mono">Phone: {addr.phone}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => startEditAddress(addr)} className="h-8 w-8 hover:bg-[#FAF2EB]">
                                  <Edit2 className="h-3.5 w-3.5 text-[#2D1B16]" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="h-8 w-8">
                                  <Trash2 className="h-3.5 w-3.5" />
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

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <Card className="border-[#E8C7AF]/60 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-[#2D1B16]">Security</CardTitle>
                  <CardDescription className="text-neutral-500">Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3E2923] uppercase tracking-wider">New Password</label>
                      <Input
                        type="password"
                        required
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="border-[#E8C7AF]/80 focus:ring-[#2D1B16]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#3E2923] uppercase tracking-wider">Confirm New Password</label>
                      <Input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Repeat your new password"
                        className="border-[#E8C7AF]/80 focus:ring-[#2D1B16]"
                      />
                    </div>
                    <Button type="submit" disabled={changingPassword} className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A] px-6">
                      {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2D1B16]">My Orders</h2>
                  <p className="text-sm text-[#8C6D62]">View and track all your previous purchases</p>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#8C6D62]" />
                    <p className="text-xs text-neutral-500 mt-2">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#E8C7AF] rounded-2xl bg-[#FAF2EB]/40">
                    <Package className="h-16 w-16 mx-auto text-[#8C6D62] mb-4 opacity-50" />
                    <h3 className="text-xl font-medium text-[#2D1B16] mb-2 font-serif">No orders yet</h3>
                    <p className="text-neutral-600 text-sm mb-6 max-w-sm mx-auto">
                      You haven't placed any orders yet. Explore our handcrafted collection to find something you love.
                    </p>
                    <Button asChild className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                      <Link href="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden border-[#E8C7AF]/60 shadow-xs hover:border-[#2D1B16]/30 transition-all">
                        <CardHeader className="bg-[#FAF2EB]/50 border-b border-[#FAF2EB] py-4 px-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <CardTitle className="text-base font-semibold text-[#2D1B16]">
                                  Order #{order.id.slice(0, 8).toUpperCase()}
                                </CardTitle>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                                    order.status === 'paid' || order.status === 'delivered'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : order.status === 'pending'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <CardDescription className="flex items-center gap-1.5 text-xs text-neutral-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left sm:text-right">
                                <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Total Amount</p>
                                <p className="text-lg font-bold font-serif text-[#2D1B16]">
                                  ₹{order.total_amount?.toLocaleString()}
                                </p>
                              </div>
                              <Button variant="outline" size="sm" asChild className="border-[#2D1B16]/20 hover:bg-[#FAF2EB] text-xs h-9">
                                <Link href={`/orders/${order.id}`}>
                                  Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-[#FAF2EB]">
                            {order.items?.map((item) => {
                              const product = item.product
                              const imageUrl = product?.images?.[0]?.image_url
                              const productName = item.product_name || product?.name || 'Product'

                              return (
                                <Link
                                  href={product?.slug ? `/product/${product.slug}` : '#'}
                                  key={item.id}
                                  className={`block transition-colors hover:bg-[#FAF2EB]/30 ${
                                    !product?.slug ? 'pointer-events-none' : ''
                                  }`}
                                >
                                  <div className="p-4 flex gap-4 items-center">
                                    <div className="relative h-16 w-16 flex-shrink-0 bg-neutral-100 rounded-lg overflow-hidden border border-[#E8C7AF]/50">
                                      <Image
                                        src={imageUrl || '/default-product.jpeg'}
                                        alt={productName}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm text-[#2D1B16] truncate">{productName}</h4>
                                      {item.variant_details && (
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                          {item.variant_details.variant_type}: {item.variant_details.variant_value}
                                        </p>
                                      )}
                                      <div className="flex items-center justify-between mt-1 text-xs">
                                        <span className="text-neutral-500">Qty: {item.quantity}</span>
                                        <span className="font-semibold text-[#2D1B16]">
                                          ₹{(item.price_at_purchase || item.price || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2D1B16]">My Wishlist</h2>
                  <p className="text-sm text-[#8C6D62]">Saved items you love and want to revisit later</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#E8C7AF] rounded-2xl bg-[#FAF2EB]/40">
                    <Heart className="h-16 w-16 mx-auto text-[#8C6D62] mb-4 opacity-50" />
                    <h3 className="text-xl font-medium text-[#2D1B16] mb-2 font-serif">Your wishlist is empty</h3>
                    <p className="text-neutral-600 text-sm mb-6 max-w-sm mx-auto">
                      Explore our catalog and tap the heart icon on any product to save it here.
                    </p>
                    <Button asChild className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                      <Link href="/shop">Explore Products</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlist.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden group border-[#E8C7AF]/60 hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative h-56 bg-neutral-100 overflow-hidden">
                          {product.images && product.images[0]?.image_url ? (
                            <Image
                              src={product.images[0].image_url}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-400">
                              <Heart className="h-12 w-12" />
                            </div>
                          )}
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full text-rose-600 hover:bg-white hover:scale-110 shadow-xs transition-all"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <CardContent className="p-4">
                          <Link href={`/product/${product.slug}`}>
                            <h3 className="font-medium text-sm text-[#2D1B16] hover:text-[#8C6D62] transition-colors mb-1 line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between mt-3">
                            <p className="font-serif font-bold text-base text-[#2D1B16]">
                              ₹{product.price?.toLocaleString()}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A] text-xs h-8 px-3"
                            >
                              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                              Add to Cart
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUPPORT TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[#2D1B16]">Support Tickets</h2>
                    <p className="text-sm text-[#8C6D62]">Track customer support requests and get help</p>
                  </div>
                  <Button asChild className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                    <Link href="/support/create">
                      <Plus className="mr-2 h-4 w-4" /> New Ticket
                    </Link>
                  </Button>
                </div>

                {loadingTickets ? (
                  <div className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#8C6D62]" />
                    <p className="text-xs text-neutral-500 mt-2">Loading your support tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-[#E8C7AF] rounded-2xl bg-[#FAF2EB]/40">
                    <MessageSquare className="h-16 w-16 mx-auto text-[#8C6D62] mb-4 opacity-50" />
                    <h3 className="text-xl font-medium text-[#2D1B16] mb-2 font-serif">No support tickets found</h3>
                    <p className="text-neutral-600 text-sm mb-6 max-w-sm mx-auto">
                      Have a query about your order, shipping, or need special customization? Open a ticket anytime.
                    </p>
                    <Button asChild className="bg-[#2D1B16] text-white hover:bg-[#1A0E0A]">
                      <Link href="/support/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Support Ticket
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card
                        key={ticket.id}
                        className="border-[#E8C7AF]/60 shadow-xs hover:border-[#2D1B16]/30 transition-all overflow-hidden"
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-neutral-500 font-semibold">
                                  #{ticket.id.slice(0, 8).toUpperCase()}
                                </span>
                                <h3 className="font-semibold text-[#2D1B16] text-base">{ticket.subject}</h3>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                                    ticket.status === 'open'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : ticket.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : ticket.status === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                                  }`}
                                >
                                  {ticket.status?.replace('_', ' ')}
                                </span>
                                {ticket.priority && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                      ticket.priority === 'urgent' || ticket.priority === 'high'
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                  >
                                    {ticket.priority} priority
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                Created on{' '}
                                {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>

                            <Button variant="outline" size="sm" asChild className="border-[#2D1B16]/20 hover:bg-[#FAF2EB] text-xs h-9 self-start sm:self-auto">
                              <Link href={`/support/${ticket.id}`}>
                                View Ticket <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#8C6D62]" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
