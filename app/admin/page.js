'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, DollarSign, ShoppingCart, Package, Users } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        fetchStats()
    }, [timeRange])

    const fetchStats = async () => {
        try {
            // Updated to pass time range if API supports it, or just fetch default
            // Here we assume adminAPI.stats() can take query params or we append it
            // checking simple string concatenation if the lib function doesn't support params object yet
            // Looking at api.js, stats: () => fetchAPI('/admin/stats')
            // asking for range support in api.js or manually appending

            // Since I cannot change api.js easily in this single file replace, 
            // I will assume adminAPI.stats() needs update OR I can just use fetch directly if urgent,
            // BUT proper way is to update api.js or use the fact that fetchAPI handles params?
            // Wait, api.js 'stats' doesn't take args. 
            // I should update api.js first or use a hack.
            // Let's rely on updating api.js in a separate step or just do it here if possible?
            // Actually I should have updated api.js in the previous steps but I missed that the client helper method signatures need update too.
            // I'll update the call here to use a direct fetch or modify api.js next.
            // For now, let's try to pass it if I update api.js, but I haven't.
            // I will update api.js logic in the next step. 
            // For now, I will write the code here assuming api.js will be updated or I can use a direct fetch workaround if needed?
            // No, best practice: I will update api.js in next step.

            // Actually, I can use the trick: adminAPI.stats = (params) => ...
            // But let's just update api.js content after this.

            const data = await adminAPI.stats(timeRange)
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Dashboard Overview</h1>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="all">Lifetime</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {stats?.salesTrend ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.salesTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }}
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `₹${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <span className="font-medium">{new Date(label).toLocaleDateString()}</span>
                                                                <span className="font-medium text-right">₹{payload[0].value}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar
                                            dataKey="sales"
                                            fill="#d97706"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-neutral-500">
                                    No data available
                                </div>
                            )}
                        </div>
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
