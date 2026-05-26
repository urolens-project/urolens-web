/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { ReleaseMethodSelector } from '../components/ReleaseMethodSelector';

describe('ReleaseMethodSelector', () => {
  it('renders both options', () => {
    render(<ReleaseMethodSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Physical Printout')).toBeInTheDocument();
    expect(screen.getByLabelText('Digital Delivery')).toBeInTheDocument();
  });

  it('has no option pre-selected by default', () => {
    render(<ReleaseMethodSelector value={null} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('marks the passed value as checked', () => {
    render(<ReleaseMethodSelector value="PHYSICAL" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Physical Printout')).toBeChecked();
    expect(screen.getByLabelText('Digital Delivery')).not.toBeChecked();
  });

  it('calls onChange with PHYSICAL when Physical Printout is clicked', () => {
    const onChange = vi.fn();
    render(<ReleaseMethodSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Physical Printout'));
    expect(onChange).toHaveBeenCalledWith('PHYSICAL');
  });

  it('calls onChange with DIGITAL when Digital Delivery is clicked', () => {
    const onChange = vi.fn();
    render(<ReleaseMethodSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Digital Delivery'));
    expect(onChange).toHaveBeenCalledWith('DIGITAL');
  });
});
