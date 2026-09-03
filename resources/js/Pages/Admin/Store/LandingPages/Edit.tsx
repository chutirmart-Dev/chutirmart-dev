import React from 'react';
import LandingBuilder from '@/components/builder/LandingBuilder';

interface EditProps {
    page: any;
    products: any[];
}

export const Edit: React.FC<EditProps> = ({ page, products }) => {
    return <LandingBuilder page={page} products={products} isCreate={false} />;
};

export default Edit;
