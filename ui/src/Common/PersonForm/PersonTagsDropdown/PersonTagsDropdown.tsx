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

import FormTagsField from "../../FormTagsField/FormTagsField";
import {MetadataReactSelectProps} from "../../SelectWithCreateOption/SelectWithCreateOption";
import PersonTagClient from "../../../Services/Api/PersonTagClient";
import ToolTip from "../../ToolTips/ToolTip";
import React from "react";
import {Tag} from "../../../Types/Tag";
import {JSX} from "@babel/types";

interface Props {
    value: Tag[],
    selectedPersonTags: Tag[],
    setSelectedPersonTags(selectedTags: Tag[]): void;
    setIsLoading(isLoading: boolean): void;
    isLoading: boolean;
}

function PersonTagsDropdown({ value, selectedPersonTags, setSelectedPersonTags, setIsLoading, isLoading }: Props) {
    const toolTipContent = (): JSX.Element => (
        <span className="toolTipContent">
            Create tags based on your people. Example, skills, education, employee status, etc. Anything on which you would like to filter.
        </span>
    );

    return (
        <FormTagsField
            tagsMetadata={MetadataReactSelectProps.PERSON_TAGS}
            tagClient={PersonTagClient}
            currentTagsState={{currentTags: value}}
            selectedTagsState={{selectedTags: selectedPersonTags, setSelectedTags: setSelectedPersonTags}}
            loadingState={{isLoading, setIsLoading}}
            toolTip={<ToolTip toolTipLabel="What's this?" contentElement={toolTipContent()}/>}
        />
    )
}

export default PersonTagsDropdown;