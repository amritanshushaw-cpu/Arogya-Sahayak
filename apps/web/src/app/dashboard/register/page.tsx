"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPatient() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/patients/new');
  }, [router]);
  return null;
}
