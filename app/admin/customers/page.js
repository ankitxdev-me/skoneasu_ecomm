'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Loader2, User, Mail, Calendar, Phone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function CustomersPage() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        try {
            const data = await adminAPI.customers.getAll()
            setCustomers(data || [])
        } catch (error) {
            console.error('Failed to load customers', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Customers</h1>
                <div className="bg-neutral-100 px-4 py-2 rounded-full text-sm font-medium text-neutral-600">
                    Total: {customers.length}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Customers</CardTitle>
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
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={customer.avatar_url} />
                                                    <AvatarFallback>
                                                        {customer.full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-neutral-900">{customer.full_name || 'Unnamed User'}</div>
                                                    <div className="text-xs text-neutral-500 md:hidden">{customer.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Mail className="h-3 w-3" />
                                                {customer.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Phone className="h-3 w-3" />
                                                {customer.phone || 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-neutral-400 font-mono">
                                            {customer.id.substring(0, 8)}...
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {customers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                                            No customers found.
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
