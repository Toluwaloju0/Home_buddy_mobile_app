"use client";

import Body from './body'
import Ajah from './ajah'
import Berger from './berger'
import Epe from './epe';
import Gbagada from './gbagada';
import Ikorodu from './ikorodu';
import Ikoyi from './ikoyi';
import Lekki from './lekki';
import VI from './vi';
import Yaba from './yaba';
import Footer from '@/components/Footer';

const page = () => {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
        <Body />
        <Ajah />
        <Berger />
        <Epe />
        <Gbagada/>
        <Ikorodu />
        <Ikoyi />
        <Lekki />
        <VI />
        <Yaba />
      </div>
      <Footer />
    </div>
  )
}

export default page