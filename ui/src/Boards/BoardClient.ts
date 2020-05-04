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
import {Board} from './Board';
import {Product} from '../Products/Product';

class BoardClient {
    static async getAllBoards(): Promise<AxiosResponse> {
        const spaceName = window.location.pathname;
        if (!spaceName || spaceName.length <= 1) {
            return Promise.reject();
        }
        return Axios.get(`${process.env.REACT_APP_URL}board${spaceName}`);
    }

    static async createEmptyBoard(name: string): Promise<AxiosResponse> {
        const products: Array<Product> = [];
        const board: Board = {name, products} as Board;
        return this.createBoard(board);
    }

    static async createBoard(board: Board): Promise<AxiosResponse> {
        const spaceName = window.location.pathname;
        return Axios.post(
            `${process.env.REACT_APP_URL}board${spaceName}`,
            board,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    static async deleteBoard(boardId: number): Promise<AxiosResponse> {
        return Axios.delete(
            `${process.env.REACT_APP_URL}board/${boardId}`
        );
    }

    static async updateBoard(id: number, name: string): Promise<AxiosResponse> {
        const spaceName = window.location.pathname;

        return Axios.put(`${process.env.REACT_APP_URL}board/${id}${spaceName}`,
            {name},
            {headers: {'Content-Type': 'application/json'}}
        );
    }

}

export default BoardClient;