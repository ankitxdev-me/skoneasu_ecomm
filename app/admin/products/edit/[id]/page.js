'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminAPI, categoryAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function EditProductPage({ params }) {
    const router = useRouter()
    const { id } = params
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_ids: [],
        featured: false,
        images: []
    })

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const [productData, categoryData] = await Promise.all([
                adminAPI.products.getAll(), // Ideally getById, but getAll filters client side if needed or we add getById
                categoryAPI.getAll()
            ])

            // Finding product from list for now as adminAPI doesn't stick getById for admin yet?
            // Actually let's assume we can fetch it or just filter it from getAll if getById missing
            // But wait, adminAPI.products.getAll returns all.
            // Let's check api.js: adminAPI.products has getAll. And update takes id.
            // We should add getById to adminAPI.products or use the public productAPI.getBySlug if consistent
            // But public API might not return hidden fields.
            // Let's use filters for now or add getById.
            // Actually, we can use the public getById if we know the ID? Public uses slug.
            // Let's try to find it in the getAll() list for MVP simplicity.

            const product = productData.find(p => p.id === id)
            if (!product) {
                toast.error('Product not found')
                return
            }

            setCategories(categoryData || [])
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                stock_quantity: product.stock_quantity,
                category_ids: product.categories?.map(c => c.category_id || c.id) || (product.category_id ? [product.category_id] : []), // Handle legacy category_id if present
                featured: product.featured || false,
                images: product.images?.map(img => img.image_url) || []
            })
        } catch (error) {
            console.error('Failed to load data', error)
            toast.error('Failed to load product data')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `products/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, publicUrl]
            }))
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Failed to upload image')
            console.error(error)
        }
    }

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            await adminAPI.products.update(id, {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity)
            })
            toast.success('Product updated successfully')
            router.push('/admin/products')
        } catch (error) {
            toast.error(error.message || 'Failed to update product')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categories</label>
                                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-white">
                                    {categories.map(c => (
                                        <div key={c.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`cat-${c.id}`}
                                                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                                                checked={formData.category_ids.includes(c.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        category_ids: checked
                                                            ? [...prev.category_ids, c.id]
                                                            : prev.category_ids.filter(id => id !== c.id)
                                                    }))
                                                }}
                                            />
                                            <label htmlFor={`cat-${c.id}`} className="text-sm cursor-pointer select-none flex-1">
                                                {c.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border p-3 rounded-md bg-neutral-50/50 md:col-span-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                />
                                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
                                    Featured Product (Show in Featured section)
                                </label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (₹)</label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock Quantity</label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Images</label>
                            <div className="flex flex-wrap gap-4">
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative h-24 w-24 bg-neutral-100 rounded border border-neutral-200">
                                        <Image src={url} alt="Product" fill className="object-cover rounded" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded cursor-pointer hover:bg-neutral-50">
                                    <Upload className="h-6 w-6 text-neutral-400 mb-1" />
                                    <span className="text-xs text-neutral-500">Upload</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Product
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
