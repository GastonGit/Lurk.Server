import { render, screen } from '@testing-library/react';
import App from '../components/App';

test('renders unmute button image', () => {
    render(<App />);
    const imgElement = screen.queryByAltText('unmute');
    expect(imgElement).toBeInTheDocument();
});
