import React from 'react';
import LandingBuilder from '@/components/builder/LandingBuilder';

interface CreateProps {
    products: any[];
}

export const Create: React.FC<CreateProps> = ({ products }) => {
    return <LandingBuilder products={products} isCreate={true} />;
};

export default Create;
