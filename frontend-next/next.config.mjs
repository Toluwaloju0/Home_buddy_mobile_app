/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
	outputFileTracingRoot: path.join(process.cwd(), '..'),
	async rewrites() {
		const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

		return [
			{
				source: '/api/backend/:path*',
				destination: `${backendUrl}/:path*`,
			},
		];
	},
};

export default nextConfig;
