import Body from "./body";
import AjahAgents from "./AjahAgents"
import BergerAgents from "./BergerAgents";
import EpeAgents from "./EpeAgents";
import GbagadaAgents from "./GbagadaAgents";
import IkoroduAgents from "./IkoroduAgents";
import IkoyiAgents from "./IkoyiAgent";
import LekkiAgents from "./LekkiAgent";
import VIAgents from "./VIAgents";
import YabaAgents from "./YabaAgents";
import Footer from '@/components/Footer';

const page = () => {
    return (
    <div>
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
        <Body />
        <AjahAgents />
        <BergerAgents />
        <EpeAgents />
        <GbagadaAgents />
        <IkoroduAgents />
        <IkoyiAgents />
        <LekkiAgents />
        <VIAgents />
        <YabaAgents />
      </div>
      <Footer />
    </div>
    )
}

export default page