import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 출력 설정 (정적 사이트 생성용)
  output: 'standalone',
};

export default nextConfig;
