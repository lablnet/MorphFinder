import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { CUSTOM_ICONS } from '@renderer/components/fileicons/icons';

describe('Custom File Icons', () => {
  it('renders all custom icon SVG components without throwing', () => {
    const iconComponents = Array.from(new Set(Object.values(CUSTOM_ICONS)));

    for (const IconComp of iconComponents) {
      const { container } = render(<IconComp size={24} />);
      expect(container.querySelector('svg')).toBeDefined();
    }
  });
});
