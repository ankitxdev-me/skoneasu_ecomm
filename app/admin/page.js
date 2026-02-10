'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const data = await adminAPI.stats()
            setStats(data)
        } catch (error) {
            toast.error('Failed to load stats')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-neutral-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    description="Lifetime sales"
                />
                <StatsCard
                    title="Orders"
                    value={stats?.orderCount || '0'}
                    icon={ShoppingCart}
                    description="Total orders placed"
                />
                <StatsCard
                    title="Products"
                    value={stats?.productCount || '0'}
                    icon={Package}
                    description="Active products"
                />
                <StatsCard
                    title="Customers"
                    value={stats?.customerCount || '0'}
                    icon={Users}
                    description="Registered users"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-500">No recent activity to show.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-neutral-500">Chart data unavailable.</p>
                    </CardContent>
                </Card>
            </div>


            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentSettingsForm />
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}

import { supabase } from '@/lib/supabase' // Add import
import { X, Upload } from 'lucide-react' // Add imports

function SettingsForm() {
    const [settings, setSettings] = useState({
        shipping_fee: '',
        free_shipping_threshold: '',
        home_hero_image: ''
    })
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await adminAPI.settings.get()
            setSettings({
                shipping_fee: data.shipping_fee,
                free_shipping_threshold: data.free_shipping_threshold,
                home_hero_image: data.home_hero_image || '',
                cod_enabled: data.cod_enabled === 'true' || data.cod_enabled === true
            })
        } catch (error) {
            console.error('Failed to load settings', error)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `hero-${Math.random()}.${fileExt}`
            const filePath = `store-assets/${fileName}`

            // Upload to 'products' bucket for now as it's likely public, or 'store-assets' if created. 
            // Using 'products' bucket to be safe as we know it exists and works from product page.
            // Actually, let's try 'products' to be safe.
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setSettings({ ...settings, home_hero_image: publicUrl })
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Failed to upload image')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = () => {
        setSettings({ ...settings, home_hero_image: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await adminAPI.settings.update(settings)
            toast.success('Settings updated successfully')
        } catch (error) {
            toast.error('Failed to update settings')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Shipping Fee (₹)</label>
                    <input
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.shipping_fee}
                        onChange={(e) => setSettings({ ...settings, shipping_fee: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Free Shipping Threshold (₹)</label>
                    <input
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.free_shipping_threshold}
                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Homepage Hero Image</label>

                    {settings.home_hero_image ? (
                        <div className="relative aspect-video w-full bg-neutral-100 rounded border border-neutral-200 overflow-hidden">
                            <img src={settings.home_hero_image} alt="Hero" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded cursor-pointer hover:bg-neutral-50">
                            {uploading ? (
                                <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                                    <span className="text-sm text-neutral-500">Click to upload image</span>
                                </>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                        </label>
                    )}
                    <p className="text-xs text-muted-foreground">Upload a high-quality image for the homepage banner (recommended size: 1920x1080).</p>
                </div>
            </div>



            <div className="flex justify-end">
                <button
                    type="submit"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    disabled={loading}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}

function PaymentSettingsForm() {
    const [codEnabled, setCodEnabled] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const data = await adminAPI.settings.get()
            setCodEnabled(String(data.cod_enabled) === 'true')
        } catch (error) {
            console.error('Failed to load payment settings', error)
        }
    }

    const handleToggle = async (checked) => {
        setCodEnabled(checked)
        setLoading(true)
        try {
            await adminAPI.settings.update({ cod_enabled: checked })
            toast.success(checked ? 'COD Enabled' : 'COD Disabled')
        } catch (error) {
            toast.error('Failed to update payment settings')
            loadSettings() // Revert on error
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <label className="text-base font-medium">Cash on Delivery (COD)</label>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable COD option for customers at checkout.
                    </p>
                </div>
                <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={codEnabled}
                            onChange={(e) => handleToggle(e.target.checked)}
                            disabled={loading}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </div>
            </div>
        </div>
    )
}

function StatsCard({ title, value, icon: Icon, description }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-neutral-500">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}
