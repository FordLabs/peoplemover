
export interface Product {
    name: string;
    location: string;
    archived: boolean;
    tags: Array<string>;
    startDate: unknown;
    nextPhaseDate: unknown;
    notes: string;
}

const product: Product = {
    name: 'Automated Test Product',
    location: 'Michigan',
    archived: false,
    tags: ['Tag 1', 'Tag 2'],
    startDate: Cypress.moment(),
    nextPhaseDate: Cypress.moment().add(1, 'days'),
    notes: 'Product note.',
};

export default product;
