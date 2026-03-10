import Body from './body';
import Agents from './agents';
import Footer from '@/components/Footer';

const page = () => {
	return (
		<div>
			<div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-20">
				<Body />
				<Agents />
			</div>
			<Footer />
		</div>
	)
}

export default page