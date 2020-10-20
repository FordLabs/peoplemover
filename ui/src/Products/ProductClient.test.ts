import ProductClient from "./ProductClient";
import {Product} from "./Product";
import axios, {AxiosPromise} from 'axios';
import {MatomoWindow} from "../CommonTypes/MatomoWindow";
import AssignmentClient from "../Assignments/AssignmentClient";
import TestUtils from "../tests/TestUtils";

jest.mock('axios');
declare let window: MatomoWindow;

describe('ProductClient', () => {

    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    it('should push create product action on create', async () => {
        let expectedName = "Floam";
        let product: Product = {
            archived: false,
            assignments: [],
            id: 0,
            name: expectedName,
            productTags: [],
            spaceId: 0
        };

        let expectedResponse = {};
        axios.post = jest.fn(() => Promise.resolve(expectedResponse as any));

        let axiosResponse = await ProductClient.createProduct("a uuid", product);

        expect(axiosResponse).toBe(expectedResponse);

        expect(window._paq).toContainEqual(['trackEvent', 'Product', 'create', expectedName])

    });

    it('should push createError on create with failure code', async () => {
        let expectedName = "Floam";
        let product: Product = {
            archived: false,
            assignments: [],
            id: 0,
            name: expectedName,
            productTags: [],
            spaceId: 0,
        };

        let expectedResponse = {code: 417};
        axios.post = jest.fn(() => Promise.reject(expectedResponse as any));

        try {
            await ProductClient.createProduct("a uuid", product);
        } catch(err)  {
            expect(window._paq).toContainEqual(['trackEvent', 'Product', 'createError', expectedName, expectedResponse.code])
        }

    });
});
