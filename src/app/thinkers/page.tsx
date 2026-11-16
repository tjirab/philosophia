import React from 'react';
import { Metadata } from 'next';
import { philosophers, eras, traditions } from '../../lib/graph/graph-service';
import { ThinkersCatalogView } from '../../components/catalog/ThinkersCatalogView';

export const metadata: Metadata = {
  title: 'Thinkers & Philosophers | Dialectical Canon | Philosophia',
  description:
    'Chronological and topological directory of philosophers, psychologists, and sociologists mapped across history in Philosophia.',
};

export default function ThinkersPage() {
  return (
    <ThinkersCatalogView
      initialThinkers={philosophers}
      eras={eras}
      traditions={traditions}
    />
  );
}
