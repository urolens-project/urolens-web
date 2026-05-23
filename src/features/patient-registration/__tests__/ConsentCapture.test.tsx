/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentCapture } from '../components/ConsentCapture';
import type { ConsentData } from '../types';

const defaultConsent: ConsentData = {
  consent_given: false,
  consent_storage: false,
  consent_research: false,
};

describe('ConsentCapture', () => {
  it('renders all three consent checkboxes', () => {
    render(
      <ConsentCapture
        value={defaultConsent}
        onChange={() => {}}
        showErrors={false}
      />,
    );

    expect(
      screen.getByText(/consent to the collection and use of my personal/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/consent to the storage of my personal/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/consent to the use of anonymized data/i),
    ).toBeInTheDocument();
  });

  it('fires onChange with updated consent when a checkbox is clicked', () => {
    const handleChange = vi.fn();

    render(
      <ConsentCapture
        value={defaultConsent}
        onChange={handleChange}
        showErrors={false}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith({
      ...defaultConsent,
      consent_given: true,
    });
  });

  it('shows inline errors when showErrors=true and checkboxes are unchecked', () => {
    render(
      <ConsentCapture
        value={defaultConsent}
        onChange={() => {}}
        showErrors={true}
      />,
    );

    const errors = screen.getAllByText('This consent is required.');
    expect(errors).toHaveLength(3);
  });

  it('does not show inline errors when showErrors=false', () => {
    render(
      <ConsentCapture
        value={defaultConsent}
        onChange={() => {}}
        showErrors={false}
      />,
    );

    expect(screen.queryByText('This consent is required.')).not.toBeInTheDocument();
  });

  it('does not show error for checked consent even when showErrors=true', () => {
    const halfConsented: ConsentData = {
      consent_given: true,
      consent_storage: false,
      consent_research: false,
    };

    render(
      <ConsentCapture
        value={halfConsented}
        onChange={() => {}}
        showErrors={true}
      />,
    );

    const errors = screen.getAllByText('This consent is required.');
    expect(errors).toHaveLength(2);
  });
});
