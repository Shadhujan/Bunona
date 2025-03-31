import { Banana } from 'lucide-react';
import React from 'react';

const DecorativeBanana: React.FC = () => {
    return (
        <>
            {/* Decorative Bananas */}
            <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12 pointer-events-none">
                <Banana className="w-full h-full text-yellow-600 opacity-20" />
            </div>
            <div className="fixed top-10 right-0 w-24 h-24 transform rotate-45 pointer-events-none">
                <Banana className="w-full h-full text-yellow-600 opacity-20" />
            </div>
        </>
    );
};

export default DecorativeBanana;