/*
 * Copyright (c) 2019 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Axios, {AxiosResponse} from 'axios';
import {AssignmentDTO} from '../Domain/AssignmentDTO';
import {Assignment} from './Assignment';
import {CreateAssignmentsRequest} from "./CreateAssignmentRequest";

class AssignmentClient {

    static async updateAssignment(assignment: AssignmentDTO): Promise<AxiosResponse> {
        return Axios.put(
            process.env.REACT_APP_URL + 'assignment/' + assignment.id,
            assignment
        );
    }

    static async deleteAssignment(assignment: Assignment): Promise<AxiosResponse> {
        return Axios.delete(
            process.env.REACT_APP_URL + 'assignment/' + assignment.id
        );
    }

    static async createAssignment(assignment: AssignmentDTO): Promise<AxiosResponse> {
        return Axios.post(`${process.env.REACT_APP_URL}/assignment`, assignment);
    }

    static async createAssignmentUsingIds(personId: number, productId: number, placeholder: boolean): Promise<AxiosResponse> {
        return Axios.post(process.env.REACT_APP_URL + 'assignment', {personId, productId, placeholder: placeholder});
    }

    static async createAssignmentsUsingIds(personId: number, productIds: Array<number>, placeholderValues?: Array<boolean>): Promise<Array<AxiosResponse>> {
        return Promise.all(productIds.map(async (productId: number, index: number) =>
            await this.createAssignmentUsingIds(personId, productIds[index], placeholderValues ? placeholderValues[index] : false)
        ));
    }

    static async createAssignmentForDate(assignment: CreateAssignmentsRequest): Promise<AxiosResponse> {
        return Axios.post(`${process.env.REACT_APP_URL}/assignment`, assignment);
    }

    static async getAssignmentsUsingPersonId(personId: number): Promise<AxiosResponse> {
        return Axios.get(process.env.REACT_APP_URL + 'person/' + personId + '/assignments');
    }

    static async getAssignmentsForDate(spaceId: number, date: string): Promise<AxiosResponse> {
        return Axios.get(process.env.REACT_APP_URL + 'assignment/' + spaceId + '/' + date);
    }

    static async updateAssignmentsUsingIds(personId: number, productIds: Array<number>, initialProductIds: Array<number>): Promise<void> {
        const newAssignments = productIds.filter(id => !initialProductIds.includes(id));
        newAssignments.forEach(productId => {
            this.createAssignmentUsingIds(personId, productId, false);
        });

        const assignments = (await this.getAssignmentsUsingPersonId(personId)).data;

        const deleteAssignments = initialProductIds.filter((id: number) => !productIds.includes(id));
        deleteAssignments.forEach((productId: number) => {
            const toBeDeletedAssignment = assignments.find((assignment: Assignment) => assignment.productId === productId);
            this.deleteAssignment(toBeDeletedAssignment).then();
        });
    }
}

export default AssignmentClient;
