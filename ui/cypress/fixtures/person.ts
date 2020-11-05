interface Person {
    name: string;
    isNew: boolean;
    role: string;
    assignTo: string;
    notes: string;
}

const person: Person = {
    name: 'Person Name',
    isNew: true,
    role: 'Product Owner',
    assignTo: 'My Product',
    notes: 'Person Note.',
};

export default person;