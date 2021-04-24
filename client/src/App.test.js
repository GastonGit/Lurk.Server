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
            const clips = ['https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4',
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1147897618.mp4',
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1147927108.mp4',
                'https://clips-media-assets2.twitch.tv/AT-cm%7C1148212903.mp4'];
            jest.spyOn(global, "fetch").mockImplementation(() =>
                Promise.resolve({
                    json: () => Promise.resolve(clips)
                })
            );

            await act(async () => {
                render(<App/>, container);
            });

            expect(
                container.querySelector(".videoClip").getAttribute("src")
            ).toEqual("https://clips-media-assets2.twitch.tv/AT-cm%7C1140679825.mp4");

            global.fetch.mockRestore();
        });
    });
});
