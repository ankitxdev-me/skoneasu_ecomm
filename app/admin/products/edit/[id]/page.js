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
import { Loader2, ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Image from 'next/image'

export default function EditProductPage({ params }) {
    const router = useRouter()
    const { id } = params
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])

    // Generator State
    const [options, setOptions] = useState([]) // [{ name: 'Size', values: ['S', 'M'] }]
    const [generatedVariants, setGeneratedVariants] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_ids: [],
        featured: false,
        images: [],
        variants: []
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
                images: product.images?.map(img => img.image_url) || [],
                variants: product.variants?.map(v => ({
                    attributes: v.attributes || (v.variant_type && v.variant_value ? { [v.variant_type]: v.variant_value } : {}),
                    price_modifier: v.price_modifier,
                    stock: v.stock
                })) || []
            })

            // Reconstruct Options from existing variants
            if (product.variants && product.variants.length > 0) {
                const variants = product.variants
                const extractedOptions = {}

                variants.forEach(v => {
                    const attrs = v.attributes || (v.variant_type && v.variant_value ? { [v.variant_type]: v.variant_value } : {})
                    Object.entries(attrs).forEach(([key, val]) => {
                        if (!extractedOptions[key]) extractedOptions[key] = new Set()
                        extractedOptions[key].add(val)
                    })
                })

                const optionsList = Object.entries(extractedOptions).map(([name, valuesSet]) => ({
                    name,
                    values: Array.from(valuesSet)
                }))

                setOptions(optionsList)

                // Set generated variants state
                setGeneratedVariants(variants.map(v => ({
                    attributes: v.attributes || (v.variant_type && v.variant_value ? { [v.variant_type]: v.variant_value } : {}),
                    price_modifier: v.price_modifier,
                    stock: v.stock
                })))
            }
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

    const addOption = () => {
        setOptions([...options, { name: '', values: [] }])
    }

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index))
    }

    const updateOptionName = (index, name) => {
        const newOptions = [...options]
        newOptions[index].name = name
        setOptions(newOptions)
    }

    const addOptionValue = (index, value) => {
        if (!value.trim()) return
        const newOptions = [...options]
        if (!newOptions[index].values.includes(value)) {
            newOptions[index].values.push(value)
            setOptions(newOptions)
        }
    }

    const removeOptionValue = (optIndex, valIndex) => {
        const newOptions = [...options]
        newOptions[optIndex].values = newOptions[optIndex].values.filter((_, i) => i !== valIndex)
        setOptions(newOptions)
    }

    const generateVariants = () => {
        if (options.length === 0) return

        // Helper to generate cartesian product
        const cartesian = (args) => {
            const result = []
            const max = args.length - 1
            function helper(arr, i) {
                for (let j = 0, l = args[i].values.length; j < l; j++) {
                    const a = arr.slice(0)
                    a.push({ [args[i].name]: args[i].values[j] })
                    if (i === max) result.push(Object.assign({}, ...a))
                    else helper(a, i + 1)
                }
            }
            if (args.length > 0 && args[0].values.length > 0) helper([], 0)
            return result
        }

        const validOptions = options.filter(o => o.name && o.values.length > 0)
        if (validOptions.length === 0) return

        const combinations = cartesian(validOptions)

        // Preserve existing values if attribute match found
        const newVariants = combinations.map(combo => {
            // Check if this combination already exists in generatedVariants
            const existing = generatedVariants.find(gv => {
                // simple object comparison
                const keys1 = Object.keys(gv.attributes).sort()
                const keys2 = Object.keys(combo).sort()
                if (keys1.length !== keys2.length) return false
                return keys1.every(key => gv.attributes[key] === combo[key])
            })

            if (existing) return existing

            return {
                attributes: combo,
                price_modifier: 0,
                stock: 10
            }
        })

        setGeneratedVariants(newVariants)
        toast.success(`Generated ${newVariants.length} variants`)
    }

    const updateVariant = (index, field, value) => {
        const newVariants = [...generatedVariants]
        newVariants[index][field] = value
        setGeneratedVariants(newVariants)
    }

    const removeVariant = (index) => {
        setGeneratedVariants(generatedVariants.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            await adminAPI.products.update(id, {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                variants: generatedVariants.map(v => ({
                    attributes: v.attributes,
                    variant_name: Object.values(v.attributes).join(' / '),
                    variant_type: 'Combination', // Legacy support
                    variant_value: Object.values(v.attributes).join(' / '), // Legacy support
                    price_modifier: parseFloat(v.price_modifier || 0),
                    stock: parseInt(v.stock || 0)
                }))
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

                        {/* Variations Section */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="text-sm font-medium">Product Options</label>
                                    <p className="text-xs text-neutral-500">Define options like Size, Color to generate variants.</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                    <Plus className="mr-2 h-3 w-3" /> Add Option
                                </Button>
                            </div>

                            {/* Options Definition */}
                            <div className="space-y-4 mb-6">
                                {options.map((option, optIndex) => (
                                    <div key={optIndex} className="p-4 bg-neutral-50 rounded border">
                                        <div className="flex gap-4 mb-3">
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-neutral-500">Option Name</label>
                                                <Input
                                                    placeholder="e.g. Size, Color"
                                                    value={option.name}
                                                    onChange={(e) => updateOptionName(optIndex, e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="mt-4 text-red-500"
                                                onClick={() => removeOption(optIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-neutral-500 mb-2 block">Values</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {option.values.map((val, valIndex) => (
                                                    <span key={valIndex} className="inline-flex items-center px-2 py-1 rounded bg-white border text-sm">
                                                        {val}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOptionValue(optIndex, valIndex)}
                                                            className="ml-1 text-neutral-400 hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Type value and press Enter"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addOptionValue(optIndex, e.target.value)
                                                            e.target.value = ''
                                                        }
                                                    }}
                                                />
                                                <Button type="button" variant="secondary" onClick={(e) => {
                                                    const input = e.currentTarget.previousElementSibling
                                                    addOptionValue(optIndex, input.value)
                                                    input.value = ''
                                                }}>Add</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {options.length > 0 && (
                                <Button type="button" className="w-full mb-6" onClick={generateVariants}>
                                    Generate Variants (Update)
                                </Button>
                            )}

                            {/* Generated Variants Table */}
                            {generatedVariants.length > 0 && (
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-neutral-100 text-neutral-500">
                                            <tr>
                                                <th className="p-3 font-medium">Variant</th>
                                                <th className="p-3 font-medium w-32">Price (+₹)</th>
                                                <th className="p-3 font-medium w-32">Stock</th>
                                                <th className="p-3 font-medium w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {generatedVariants.map((variant, index) => (
                                                <tr key={index} className="bg-white">
                                                    <td className="p-3">
                                                        {Object.entries(variant.attributes).map(([key, val]) => (
                                                            <span key={key} className="mr-2 px-2 py-0.5 rounded bg-neutral-100 text-xs">
                                                                {key}: {val}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td className="p-3">
                                                        <Input
                                                            type="number"
                                                            value={variant.price_modifier}
                                                            onChange={(e) => updateVariant(index, 'price_modifier', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <Input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
        </div >
    )
}
