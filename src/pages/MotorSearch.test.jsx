import {render, screen, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import MotorSearch from './MotorSearch';
test('Master places the AI chatbot link after QR codes and keeps the empty directory usable', async () => {
  const previous = global.fetch;
  global.fetch = jest.fn().mockResolvedValue({ok: true, json: async () => []});
  try {
    render(<MemoryRouter><MotorSearch/></MemoryRouter>);
    const qr = screen.getByRole('link', {name: /Motor QR Codes/});
    const ai = screen.getByRole('link', {name: /AI Chatbot/});
    expect(ai).toHaveAttribute('href', '/assistant');
    expect(qr.compareDocumentPosition(ai) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await waitFor(() => expect(screen.getByText(/No matching motors/)).toBeInTheDocument());
  } finally { global.fetch = previous; }
});
