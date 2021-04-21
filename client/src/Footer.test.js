import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import React from 'react';

describe("Footer", () => {
    describe("About", () => {
        it("should show a text field about", async () => {
            render(<Footer />);

            const linkElement = screen.getByText(/About/i);
            expect(linkElement).toBeInTheDocument();
        });
    });
});
