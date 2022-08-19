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

import { Option } from 'Types/Option';
import { Tag } from 'Types/Tag';
import { JSX } from '@babel/types';
import React, { useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { TagRequest } from 'Types/TagRequest';
import SelectWithCreateOption, {
    Metadata,
} from '../SelectWithCreateOption/SelectWithCreateOption';
import { TagClient } from 'Types/TagClient';
import { useRecoilValue } from 'recoil';
import {
    CurrentSpaceState,
    UUIDForCurrentSpaceSelector,
} from '../../State/CurrentSpaceState';

interface Props {
    loadingState: {
        isLoading: boolean;
        setIsLoading: (isLoading: boolean) => void;
    };
    currentTagsState: { currentTags: Array<Tag> };
    selectedTagsState: {
        selectedTags: Array<Tag>;
        setSelectedTags: (tags: Array<Tag>) => void;
    };
    tagClient: TagClient;
    tagsMetadata: Metadata;
    toolTip?: JSX.Element;
}

function FormTagsField({
    loadingState: { isLoading, setIsLoading },
    currentTagsState: { currentTags },
    selectedTagsState: { selectedTags, setSelectedTags },
    tagClient,
    tagsMetadata,
    toolTip,
}: Props): JSX.Element {
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);
    const [availableTags, setAvailableTags] = useState<Array<Tag>>([]);

    useEffect(() => {
        tagClient.get(uuid).then((result) => setAvailableTags(result.data));

        setSelectedTags(currentTags);
    }, [currentTags, setSelectedTags, tagClient, uuid]);

    function createTagOption(label: string, id: number): Option {
        return {
            label: label,
            value: id.toString() + '_' + label,
        };
    }

    function optionToTag(options: Array<Option>): Array<Tag> {
        if (!options) return [];

        return options.map((option) => {
            return {
                id: Number.parseInt(option.value, 10),
                name: option.label,
                spaceUuid: currentSpace.uuid ? currentSpace.uuid : '',
            };
        });
    }

    function handleCreateTag(inputValue: string): void {
        setIsLoading(true);
        const tagRequest: TagRequest = { name: inputValue };

        tagClient
            .add(tagRequest, currentSpace)
            .then((response: AxiosResponse) => {
                const newTag: Tag = response.data;
                setAvailableTags(
                    (tags) =>
                        [
                            ...tags,
                            {
                                id: newTag.id,
                                name: newTag.name,
                            },
                        ] as Array<Tag>
                );
                updateSelectedTags([...selectedTags, newTag]);
                setIsLoading(false);
            });
    }

    function updateSelectedTags(tags: Array<Tag>): void {
        const selectedTags = tags.length > 0 ? [...tags] : [];
        setSelectedTags(selectedTags);
    }

    const getOptions = (): Array<Option> => {
        return availableTags.map((tag: Tag) =>
            createTagOption(tag.name, tag.id)
        );
    };

    const onChange = (option: unknown): void =>
        updateSelectedTags(optionToTag(option as Option[]));

    return (
        <SelectWithCreateOption
            isMulti
            metadata={tagsMetadata}
            values={selectedTags.map((tag) =>
                createTagOption(tag.name, tag.id)
            )}
            options={getOptions()}
            onChange={onChange}
            onSave={handleCreateTag}
            isLoading={isLoading}
            toolTip={toolTip}
        />
    );
}

export default FormTagsField;
