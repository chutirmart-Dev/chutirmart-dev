import React from 'react';
import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TermsProps {
    terms: string;
    privacy: string;
    returns: string;
}

export const Terms: React.FC<TermsProps> = ({ terms, privacy, returns }) => {
    return (
        <StorefrontLayout>
            <Head title="শর্তাবলী ও পলিসি" />

            <div className="container py-8 max-w-2xl">
                <div className="bg-white border border-[#E3E0D8] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                    <Tabs defaultValue="terms" className="w-full">
                        <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger value="terms" className="rounded-lg text-xs md:text-sm font-bold">শর্তাবলী</TabsTrigger>
                            <TabsTrigger value="privacy" className="rounded-lg text-xs md:text-sm font-bold">প্রাইভেসি</TabsTrigger>
                            <TabsTrigger value="returns" className="rounded-lg text-xs md:text-sm font-bold">রিটার্ন</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="terms" className="pt-6">
                            <div className="prose max-w-none text-sm text-gray-600 leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: terms }} />
                        </TabsContent>
                        <TabsContent value="privacy" className="pt-6">
                            <div className="prose max-w-none text-sm text-gray-600 leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: privacy }} />
                        </TabsContent>
                        <TabsContent value="returns" className="pt-6">
                            <div className="prose max-w-none text-sm text-gray-600 leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: returns }} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default Terms;
