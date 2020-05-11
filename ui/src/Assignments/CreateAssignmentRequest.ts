import {Person} from "../People/Person";

export interface CreateAssignmentsRequest {
    requestedDate: Date;
    person: Person;
    products: Set<ProductPlaceholderPair>;
}

export interface ProductPlaceholderPair {
    productId: number;
    placeholder: boolean;
}