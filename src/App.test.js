import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Master navigation entry', () => {
  render(<App />);
  const linkElement = screen.getByRole('link', {name: /Master/});
  expect(linkElement).toBeInTheDocument();
});
