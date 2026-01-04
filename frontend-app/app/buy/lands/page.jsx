import React from 'react';
import Body from './body';
import Epe from './epe';
import Ikorodu from './ikorodu'
import Footer from '@/components/Footer';

const page = () => {
  return (
    <div> 
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
        <Body />
        <Epe />
        <Ikorodu />
      </div>
      <Footer />
    </div>
  )
}

export default page