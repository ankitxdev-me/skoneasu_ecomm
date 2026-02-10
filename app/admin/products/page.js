'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const data = await adminAPI.products.getAll()
            setProducts(data || [])
        } catch (error) {
            toast.error('Failed to load products')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            await adminAPI.products.delete(id)
            setProducts(products.filter(p => p.id !== id))
            toast.success('Product deleted')
        } catch (error) {
            toast.error('Failed to delete product')
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Products</h1>
                <Button asChild>
                    <Link href="/admin/products/add">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Products ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="relative h-12 w-12 bg-neutral-100 rounded overflow-hidden">
                                            {product.images?.[0]?.image_url && (
                                                <Image
                                                    src={product.images[0].image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        {product.featured && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Featured
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.categories?.map(c => c.category?.name).filter(Boolean).join(', ') || '-'}
                                    </TableCell>
                                    <TableCell>₹{product.price.toLocaleString()}</TableCell>
                                    <TableCell>{product.stock_quantity}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/products/edit/${product.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
