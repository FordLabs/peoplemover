/*
 * Copyright (c) 2020 Ford Motor Company
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

import {AxiosResponse} from 'axios';
import {Tag} from './Tag';
import {TagAddRequest} from './TagAddRequest';
import {TagEditRequest} from './TagEditRequest';

export interface TagClient {
     get(spaceUuid: string): Promise<AxiosResponse<Tag[]>>;
     add(addRequest: TagAddRequest, spaceUuid: string): Promise<AxiosResponse<Tag>>;
     edit(editRequest: TagEditRequest, spaceUuid: string): Promise<AxiosResponse<Tag>>;
     delete(id: number, spaceUuid: string): Promise<AxiosResponse>;
}