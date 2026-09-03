import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, StatusPill, AdminPagination, IconBtn } from '@/components/admin/ui';
import { Check, X, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewsProps {
    reviews: { data: any[]; links: any[]; total: number; };
}

export const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
    const handleStatusUpdate = (id: number, status: 'approved' | 'rejected') => {
        router.put(route('admin.reviews.update', { id }), { status }, {
            onSuccess: () => toast.success('Review status updated successfully.'),
            onError: () => toast.error('Failed to update review status.')
        });
    };

    return (
        <AdminLayout>
            <Head title="Reviews" />
            <PageHeader title="Reviews" subtitle="Approve or reject customer product ratings" />

            <AdminCard className="overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-[#F0EFFE]">
                            {['Product', 'Reviewer', 'Rating', 'Comment', 'Status', 'Date', 'Actions'].map(h => (
                                <th key={h} className="text-left text-[10px] font-black text-[#9096B0] uppercase tracking-[0.1em] px-5 py-3.5">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.data.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-16 text-[#9096B0] text-sm">
                                <Star className="w-10 h-10 mx-auto mb-3 text-[#E8E7FF]" />
                                No reviews found
                            </td></tr>
                        ) : reviews.data.map(review => (
                            <tr key={review.id} className="border-b border-[#F8F7FF] hover:bg-[#FBFAFF] transition-colors">
                                <td className="px-5 py-3.5">
                                    <p className="text-[13px] font-bold text-[#1A1A2E] max-w-[140px] truncate" title={review.product?.name}>
                                        {review.product?.name}
                                    </p>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="font-bold text-[13px] text-[#1A1A2E]">{review.reviewer_name}</div>
                                    <span className="text-[10px] text-[#9096B0] font-mono">{review.reviewer_mobile}</span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex text-amber-400">
                                        {Array.from({ length: review.rating }).map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-[12px] text-[#2D3048] max-w-xs truncate" title={review.comment}>
                                    {review.comment}
                                </td>
                                <td className="px-5 py-3.5"><StatusPill status={review.status} /></td>
                                <td className="px-5 py-3.5 text-[12px] text-[#9096B0]">
                                    {new Date(review.created_at).toLocaleDateString('en-US')}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex items-center gap-1.5 justify-end">
                                        {review.status !== 'approved' && (
                                            <IconBtn color="green" onClick={() => handleStatusUpdate(review.id, 'approved')} title="Approve">
                                                <Check className="w-4 h-4" />
                                            </IconBtn>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <IconBtn color="red" onClick={() => handleStatusUpdate(review.id, 'rejected')} title="Reject">
                                                <X className="w-4 h-4" />
                                            </IconBtn>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination links={reviews.links} />
            </AdminCard>
        </AdminLayout>
    );
};

export default Reviews;
