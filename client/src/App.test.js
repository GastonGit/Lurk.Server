import { act } from "react-dom/test-utils";
import App from './App';
import {render, unmountComponentAtNode} from "react-dom";
import React from 'react';

describe("App", () => {
    let container = null;
    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });
    describe("Fetching", () => {
        it("should fetch clips and show them in the iframe", async () => {
            const clips = ['https://clips.twitch.tv/SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl'];
            jest.spyOn(global, "fetch").mockImplementation(() =>
                Promise.resolve({
                    json: () => Promise.resolve(clips)
                })
            );

            await act(async () => {
                render(<App/>, container);
            });

            expect(
                container.querySelector(".clip-iframe").getAttribute("src")
            ).toEqual("https://clips.twitch.tv/embed?clip=SpunkySecretiveOrangeShadyLulu-KCNPm3bm3KTbuOCl&autoplay=true&parent=localhost");

            global.fetch.mockRestore();
        });
    });
});
