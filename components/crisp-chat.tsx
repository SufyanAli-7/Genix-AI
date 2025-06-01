'use client';

import { useEffect } from 'react';
import { Crisp } from 'crisp-sdk-web';

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("3f8c234f-9c01-4a1c-a8d5-b228e6a1de91");
  }, []);

  return null;
};