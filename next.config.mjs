import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {  
             remotePatterns: [
                 {
                    protocol:  'https',
                    hostname:  'avatars.githubusercontent.com', 
                 }
             ]
        
        }
};

export default nextConfig;
