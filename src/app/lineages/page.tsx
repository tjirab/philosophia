import React from 'react';
import { Metadata } from 'next';
import { edges, philosophers, concepts } from '../../lib/graph/graph-service';
import { LineagesCatalogView } from '../../components/catalog/LineagesCatalogView';

export const metadata: Metadata = {
  title: 'Canonical Intellectual Lineages | Dialectical Transmissions | Philosophia',
  description:
    'Directory of canonical dialectical transmissions, influences, critiques, and departures linking thinkers and concepts across history.',
};

export default function LineagesPage() {
  return (
    <LineagesCatalogView
      initialEdges={edges}
      philosophers={philosophers}
      concepts={concepts}
    />
  );
}
