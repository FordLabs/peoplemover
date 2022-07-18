/*
 * Copyright (c) 2021 Ford Motor Company
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
import {TagInterface} from './Tag.interface';
import {TagRequest} from './TagRequest.interface';
import {Space} from 'Types/Space';

export interface TagClient {
     get(spaceUuid: string): Promise<AxiosResponse<TagInterface[]>>;
     add(addRequest: TagRequest, space: Space): Promise<AxiosResponse<TagInterface>>;
     edit(editRequest: TagRequest, space: Space): Promise<AxiosResponse<TagInterface>>;
     delete(id: number, space: Space): Promise<AxiosResponse>;
}
