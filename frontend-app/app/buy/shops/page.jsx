import Body from "./body";
import Ikoyi from "./ikoyi";
import Yaba from "./yaba";
import Footer from '@/components/Footer';

const page = () => {
  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
        <Body />
        <Ikoyi />
        <Yaba/>
      </div>
      <Footer />
    </div>
  )
}

export default page