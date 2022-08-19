/*
 * Copyright (c) 2022 Ford Motor Company
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

import { AxiosResponse } from 'axios';
import { TagRequest } from './TagRequest';
import { Space } from 'Types/Space';
import { Tag } from 'Types/Tag';

export interface TagClient {
    get(spaceUuid: string): Promise<AxiosResponse<Tag[]>>;
    add(addRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>>;
    edit(editRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>>;
    delete(id: number, space: Space): Promise<AxiosResponse>;
}
