export interface Product {
    name: string;
    location: string;
    tags: Array<string>;
    startDate: string;
    nextPhaseDate: string;
    dorfCode: string;
    notes: string;
}

const product: Product = {
    name: 'Automated Test Product',
    location: 'Michigan',
    tags: ['Tag 1', 'Tag 2'],
    startDate: Cypress.moment().format('MM/DD/yyyy'),
    nextPhaseDate: Cypress.moment().add(1, 'days').format('MM/DD/yyyy'),
    dorfCode: '',
    notes: 'These are some VERY interesting product notes. You\'re welcome.',
};

export default product;
