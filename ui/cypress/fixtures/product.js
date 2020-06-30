const product = {
    name: 'Automated Test Product',
    location: 'Michigan',
    tags: ['Tag 1', 'Tag 2'],
    startDate: Cypress.moment().format('yyyy-MM-DD'),
    nextPhaseDate: Cypress.moment().add(1, 'days').format('yyyy-MM-DD'),
    dorfCode: 'dorf-code-123',
    notes: 'These are some VERY interesting product notes. You\'re welcome.',
};

export default product;