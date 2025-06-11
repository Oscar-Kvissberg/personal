/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        appDir: true,
        serverComponentsExternalPackages: ['pdf-parse', 'xlsx']
    }
}

module.exports = nextConfig 