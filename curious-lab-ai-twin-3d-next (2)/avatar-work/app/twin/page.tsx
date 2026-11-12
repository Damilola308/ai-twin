import type { Metadata } from 'next';
import TwinExperience from '@/components/TwinExperience';

export const metadata: Metadata = {
  title: 'Meet the AI Twin',
  description: 'Meet the AI representation of Opeyemi Ogunbona. Ask about product design, ideas and projects from THE CURIOUS LAB.',
};

export default function TwinPage() {
  return <TwinExperience />;
}
