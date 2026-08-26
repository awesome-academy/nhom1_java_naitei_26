import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { content: [] } }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders app header and footer without crashing', async () => {
  render(<App />);
  await waitFor(() => {
    const logos = screen.getAllByAltText(/Thực phẩm & Đồ uống/i);
    expect(logos.length).toBeGreaterThan(0);
  });
});
