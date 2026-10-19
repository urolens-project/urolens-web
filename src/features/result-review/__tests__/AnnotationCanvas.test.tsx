/// <reference types="vitest/globals" />

import { render, fireEvent } from '@testing-library/react';
import { AnnotationCanvas } from '../components/AnnotationCanvas';
import { PARTICLE_LABELS } from '../constants';
import type { BoundingBox } from '../types';

function mockContainerRect(container: HTMLElement) {
  const rect = container.querySelector('.relative') as HTMLElement;
  rect.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 }) as DOMRect;
  return rect;
}

describe('AnnotationCanvas', () => {
  it('draws a box with particle_type (not label), matching the canonical particle list', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <AnnotationCanvas imageUrl="https://example.com/img.png" boxes={[]} onChange={onChange} />,
    );

    fireEvent.click(getByText('Draw Box', { exact: false }));
    const canvas = mockContainerRect(container);

    fireEvent.mouseDown(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 60 });
    fireEvent.mouseUp(canvas);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [boxes] = onChange.mock.calls[0] as [BoundingBox[]];
    expect(boxes).toHaveLength(1);
    const box = boxes[0];

    expect(box).toHaveProperty('particle_type');
    expect(box).not.toHaveProperty('label');
    expect(PARTICLE_LABELS).toContain(box.particle_type);
    expect(box.w).toBeGreaterThan(0);
    expect(box.h).toBeGreaterThan(0);
  });
});
