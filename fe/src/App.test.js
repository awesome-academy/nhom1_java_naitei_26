import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header and footer without crashing', () => {
  render(<App />);
  const logos = screen.getAllByAltText(/Thực phẩm & Đồ uống/i);
  expect(logos.length).toBeGreaterThan(0);
});
