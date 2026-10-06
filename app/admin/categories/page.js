'use client'

import { useState, useEffect } from 'react'
import { adminAPI, categoryAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [editingId, setEditingId] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        is_main: false
    })

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        // ... existing implementation
        try {
            const data = await categoryAPI.getAll()
            setCategories(data || [])
        } catch (error) {
            console.error('Failed to load categories', error)
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        // ... existing implementation
        const file = e.target.files[0]
        if (!file) return

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `categories/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Failed to upload image')
            console.error(error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.is_main) {
            const currentMainCount = categories.filter(c => c.is_main && c.id !== editingId).length
            if (currentMainCount >= 4) {
                toast.error('Only 4 categories can be marked as Main for the navbar. Please unmark another category first.')
                return
            }
        }

        setSubmitting(true)

        try {
            if (editingId) {
                await adminAPI.categories.update(editingId, formData)
                toast.success('Category updated')
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('categories-updated'))
            } else {
                await adminAPI.categories.create(formData)
                toast.success('Category created')
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('categories-updated'))
            }
            setIsDialogOpen(false)
            resetForm()
            loadCategories()
        } catch (error) {
            toast.error(error.message || 'Failed to save category')
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggleMain = async (category) => {
        const newStatus = !category.is_main

        if (newStatus) {
            const currentMainCount = categories.filter(c => c.is_main && c.id !== category.id).length
            if (currentMainCount >= 4) {
                toast.error('Only 4 categories can be marked as Main for the navbar. Please unmark another category first.')
                return
            }
        }

        try {
            await adminAPI.categories.update(category.id, { is_main: newStatus })
            toast.success(`${category.name} ${newStatus ? 'marked as Main (added to Navbar)' : 'removed from Navbar'}`)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('categories-updated'))
            }
            loadCategories()
        } catch (error) {
            toast.error(error.message || 'Failed to update category status')
            console.error(error)
        }
    }

    const resetForm = () => {
        setFormData({ name: '', description: '', image_url: '', is_main: false })
        setEditingId(null)
    }

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            image_url: category.image_url || '',
            is_main: category.is_main || false
        })
        setEditingId(category.id)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            await adminAPI.categories.delete(id)
            toast.success('Category deleted')
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('categories-updated'))
            loadCategories()
        } catch (error) {
            toast.error('Failed to delete category')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Categories</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Necklaces"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Category description..."
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 border p-3 rounded-md bg-neutral-50/50">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_main"
                                        className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
                                        checked={formData.is_main}
                                        onChange={(e) => setFormData({ ...formData, is_main: e.target.checked })}
                                    />
                                    <label htmlFor="is_main" className="text-sm font-semibold cursor-pointer text-neutral-900">
                                        Show in Navbar (Main Category)
                                    </label>
                                </div>
                                <p className="text-xs text-neutral-500 pl-6">
                                    When enabled, this category is marked as Main (maximum 4 allowed). It appears directly in the store header navbar.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url ? (
                                        <div className="relative h-20 w-20 bg-neutral-100 rounded border border-neutral-200">
                                            <Image
                                                src={formData.image_url}
                                                alt="Category"
                                                fill
                                                className="object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-20 w-20 flex items-center justify-center bg-neutral-100 rounded border border-neutral-200 text-neutral-400">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded px-3 py-2 w-fit bg-white">
                                                <Upload className="h-4 w-4" /> Upload Image
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingId ? 'Update Category' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status (Navbar - Max 4)</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            {category.image_url ? (
                                                <div className="relative h-12 w-12 rounded overflow-hidden bg-neutral-100">
                                                    <img
                                                        src={category.image_url}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/default-product.jpeg';
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 bg-neutral-100 rounded flex items-center justify-center text-neutral-400">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleMain(category)}
                                                title={category.is_main ? 'Click to remove from navbar' : 'Click to show in navbar as Main'}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                                                    category.is_main
                                                        ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                                        : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200 hover:text-neutral-700'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${category.is_main ? 'bg-amber-600' : 'bg-neutral-400'}`} />
                                                {category.is_main ? 'Main' : 'Hidden'}
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-neutral-500">{category.slug}</TableCell>
                                        <TableCell className="max-w-xs truncate text-neutral-500">
                                            {category.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(category.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                                            No categories found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
