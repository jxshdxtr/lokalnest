
import React from 'react';
import { Truck, Shield, Leaf, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-10 w-10 text-blue-light" />,
    title: 'Fresh Delivery',
    description: 'Products delivered straight from local farms and artisans to your doorstep.',
  },
  {
    icon: <Leaf className="h-10 w-10 text-blue-light" />,
    title: 'Sustainably Sourced',
    description: 'We prioritize environmentally friendly and sustainable production methods.',
  },
  {
    icon: <Shield className="h-10 w-10 text-blue-light" />,
    title: 'Quality Guaranteed',
    description: 'Every product is vetted for quality and authenticity before reaching our marketplace.',
  },
  {
    icon: <HeartHandshake className="h-10 w-10 text-blue-light" />,
    title: 'Support Local',
    description: 'Your purchase directly supports local producers and their communities.',
  },
];

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Shop With Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            At LocalNook, we connect consumers directly with local producers to ensure quality, freshness, and community support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-border"
            >
              <div className="p-3 rounded-full bg-blue-light/10 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
