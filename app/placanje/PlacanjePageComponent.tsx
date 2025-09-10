'use client';

import dynamic from 'next/dynamic';
import type { FC } from 'react';

const DynamicPlacanjePage = dynamic(() => import('./PlacanjePageComponent'), { ssr: false }) as FC;

export default DynamicPlacanjePage;
