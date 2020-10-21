import ProductClient from './ProductClient';
import {Product} from './Product';
import axios from 'axios';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

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
        const expectedName = 'Floam';
        const product: Product = {
            archived: false,
            assignments: [],
            id: 0,
            name: expectedName,
            productTags: [],
            spaceId: 0,
        };

        const expectedResponse = {};
        axios.post = jest.fn(() => Promise.resolve(expectedResponse as any));

        const axiosResponse = await ProductClient.createProduct('a uuid', product);

        expect(axiosResponse).toBe(expectedResponse);

        expect(window._paq).toContainEqual(['trackEvent', 'Product', 'create', expectedName]);

    });

    it('should push createError on create with failure code', async () => {
        const expectedName = 'Floam';
        const product: Product = {
            archived: false,
            assignments: [],
            id: 0,
            name: expectedName,
            productTags: [],
            spaceId: 0,
        };

        const expectedResponse = {code: 417};
        axios.post = jest.fn(() => Promise.reject(expectedResponse as any));

        try {
            await ProductClient.createProduct('a uuid', product);
            fail("Did not catch an exception from the product creation");
        } catch (err)  {
            expect(window._paq).toContainEqual(['trackEvent', 'Product', 'createError', expectedName, expectedResponse.code]);
        }

    });
});
