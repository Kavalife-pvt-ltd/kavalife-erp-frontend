// src/test/GRNFormModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GRNFormModal } from '@/components/forms/GRNFormModal';
import { toast } from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GRNFormModal', () => {
  beforeEach(() => {
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  it('renders the modal with title', () => {
    render(<GRNFormModal onClose={jest.fn()} />);
    expect(screen.getByText(/create new grn/i)).toBeInTheDocument();
  });

  it('displays all VIR cards from mock data', () => {
    render(<GRNFormModal onClose={jest.fn()} />);
    expect(screen.getByText(/VIR 101/i)).toBeInTheDocument();
    expect(screen.getByText(/VIR 102/i)).toBeInTheDocument();
    expect(screen.getByText(/VIR 103/i)).toBeInTheDocument();
  });

  it('does not show GRN form inputs before a VIR is selected', () => {
    render(<GRNFormModal onClose={jest.fn()} />);
    expect(screen.queryByPlaceholderText(/e\.g\. 50/i)).not.toBeInTheDocument();
  });

  it('selecting a VIR card shows the details card and form fields', async () => {
    render(<GRNFormModal onClose={jest.fn()} />);
    const vir101Card = screen.getByText(/VIR 101/i).closest('div')!;
    await userEvent.click(vir101Card);

    // now wait for the details card’s unique text
    expect(await screen.findByText(/Vendor: XYZ Enterprises/i)).toBeInTheDocument();

    // and the “No. of Containers” input via its placeholder
    expect(screen.getByPlaceholderText(/e\.g\. 50/i)).toBeInTheDocument();
  });

  it('shows validation error if required fields are missing', async () => {
    render(<GRNFormModal onClose={jest.fn()} />);
    const vir101Card = screen.getByText(/VIR 101/i).closest('div')!;
    await userEvent.click(vir101Card);

    // wait for the Create button, then click it
    const submitBtn = await screen.findByRole('button', {
      name: /create grn/i,
    });
    await userEvent.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith('Please fill all required fields');
  });

  it('submits successfully when all required fields are filled', async () => {
    const onClose = jest.fn();
    // destructure container so we can query the date input
    const { container } = render(<GRNFormModal onClose={onClose} />);

    // — real timers for UI interactions —
    await userEvent.click(screen.getByText(/VIR 101/i).closest('div')!);
    await screen.findByText(/Vendor: XYZ Enterprises/i);

    await userEvent.type(screen.getByPlaceholderText(/e\.g\. 50/i), '5');
    await userEvent.type(screen.getByPlaceholderText(/e\.g\. 1000 kg/i), '500');
    await userEvent.type(screen.getByPlaceholderText(/Enter Invoice No/i), 'INV-500');
    const dateInput = container.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: '2025-06-17' } });
    const packagingSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(packagingSelect, 'packed');

    // click “Create” (synchronous)
    fireEvent.click(screen.getByRole('button', { name: /create grn/i }));
    expect(toast.success).toHaveBeenCalledWith('GRN created successfully');
    // wait (up to 1.5s) for the 1s timeout in handleSubmit → onClose
    await waitFor(() => expect(onClose).toHaveBeenCalled(), { timeout: 1500 });
  });

  it('closes when pressing Escape', () => {
    const onClose = jest.fn();
    render(<GRNFormModal onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking on the backdrop outside the modal', () => {
    const onClose = jest.fn();
    const { container } = render(<GRNFormModal onClose={onClose} />);
    // trigger mousedown so our handler fires
    fireEvent.mouseDown(container.firstElementChild!);
    expect(onClose).toHaveBeenCalled();
  });
});
