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

import React, {ChangeEvent, useState} from 'react';
import './FilterInput.scss';
import {connect} from 'react-redux';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Person} from '../People/Person';
import {Product} from '../Products/Product';
import {Dispatch} from 'redux';

interface FilterInputProps {
    optionList: Array<Person>;
    changeCallback: (person: Person) => void;
    initiallySelectedProduct: Product;
    nameAndId: string;
    labelText: string;
    listName: string;
    setCurrentModal: (modalState: CurrentModalState) => void;
}

function FilterInput({
    optionList,
    changeCallback,
    initiallySelectedProduct,
    nameAndId,
    labelText,
    listName,
    setCurrentModal,
}: FilterInputProps): JSX.Element {
    const defaultPerson: Person = {name: ''} as Person;
    const [selectedOption, setSelectedOption] = useState<Person>(defaultPerson);

    function getItemFromListWithName(name: string, list: Array<Person>): Person | undefined {
        const filteredItems = list.filter(x => x.name === name);
        return filteredItems.length > 0 ? filteredItems[0] : undefined;
    }

    function listContainsName(name: string, list: Array<Person>): boolean {
        return getItemFromListWithName(name, list) !== undefined;
    }

    function onEntryChanged(event: ChangeEvent<HTMLInputElement>): void {
        let person: Person | undefined;
        const name = event.target.value;

        if (listContainsName(name, optionList)) {
            person = getItemFromListWithName(name, optionList);
        }
        if (person === undefined) {
            setSelectedOption({id: -1, name: name} as Person);
            changeCallback({id: -1, name: name} as Person);
        } else {
            setSelectedOption(person);
            changeCallback(person);
        }
    }

    function anyListItemMatches(input: string): boolean {
        return optionList.filter(option => {
            const currentName = option.name.toLowerCase();
            const searchString = input.toLowerCase();
            return currentName.startsWith(searchString);
        }).length > 0;
    }

    function openCreatePersonModal(): void {
        const item = {
            initiallySelectedProduct: initiallySelectedProduct,
            initialPersonName: selectedOption.name,
        };
        setCurrentModal({modal: AvailableModals.CREATE_PERSON, item});
    }

    return (
        <div>
            <div className="formItem">
                <label className="formItemLabel" htmlFor={nameAndId}>{labelText}</label>
                <input className="formInput formTextInput"
                    readOnly={false}
                    type="text"
                    name={nameAndId}
                    id={nameAndId}
                    data-testid={nameAndId}
                    list={listName}
                    value={selectedOption.name}
                    onChange={onEntryChanged}
                    placeholder="Search for a person"
                    autoComplete="off"
                    autoFocus/>
            </div>
            {!(anyListItemMatches(selectedOption.name)) &&
                <div className="createNewPersonContainer">
                    <i className="createNewPersonText">Oops! This person doesn&apos;t exist.</i>
                    <a className="createNewPersonLink deleteLink"
                        onClick={openCreatePersonModal}>
                        <div className="fa fa-plus createNewPersonIcon"/>
                        Create new person
                    </a>
                </div>}
        </div>);
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(FilterInput);
