import React from 'react';
import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/layouts/StorefrontLayout';

interface AboutProps {
    content: string;
}

export const About: React.FC<AboutProps> = ({ content }) => {
    return (
        <StorefrontLayout>
            <Head title="আমাদের সম্পর্কে" />

            <div className="container py-8 max-w-2xl">
                <div className="bg-white border border-[#E3E0D8] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                    <div 
                        className="prose max-w-none text-sm text-gray-600 leading-relaxed font-normal"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </StorefrontLayout>
    );
};

export default About;
