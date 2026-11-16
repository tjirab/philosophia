import React from 'react';
import { Metadata } from 'next';
import { concepts, eras, philosophers } from '../../lib/graph/graph-service';
import { ConceptsCatalogView } from '../../components/catalog/ConceptsCatalogView';

export const metadata: Metadata = {
  title: 'Landmark Concepts & Paradigms | Dialectical Lexicon | Philosophia',
  description:
    'Philosophical lexicon of landmark concepts and paradigm shifts across epistemology, ethics, metaphysics, politics, and mind.',
};

export default function ConceptsPage() {
  return (
    <ConceptsCatalogView
      initialConcepts={concepts}
      eras={eras}
      philosophers={philosophers}
    />
  );
}
