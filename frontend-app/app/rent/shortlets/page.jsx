"use client";

import Body from './body';
import Lekki from './lekki';
import Footer from '@/components/Footer';

const page = () => {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
        <Body />
        <Lekki />
      </div>
      <Footer />  
    </div>
  )
}

export default page