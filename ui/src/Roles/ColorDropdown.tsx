import {JSX} from '@babel/types';
import SelectWithHTMLOptions, {OptionType} from '../ModalFormComponents/SelectWithHTMLOptions';
import React from 'react';
import ColorCircle from '../ModalFormComponents/ColorCircle';
import {Color} from 'Types/Color';

const colorMapping: { [key: string]: string } = {
    '#81C0FA': 'Blue',
    '#83DDC2': 'Aquamarine',
    '#A7E9F2': 'Light Blue',
    '#C9E9B0': 'Light Green',
    '#DBB5FF': 'Purple',
    '#FFD7B3': 'Orange',
    '#FCBAE9': 'Pink',
    '#FFEAAA': 'Yellow',
    '#FFFFFF': 'White',
};

interface Props {
    selectedColorId?: number;
    colors: Array<Color>;
    handleColorChange: (selectedOption: OptionType) => void;
}

const ColorDropdown = ({ selectedColorId, colors, handleColorChange }: Props, ): JSX.Element => {
    const selectedColorOption = (selectedColorId?: number): OptionType => {
        const color = colors.find(color => color.id === selectedColorId ) || colors[colors.length - 1];
        return {
            value: color,
            ariaLabel: colorMapping[color.color],
            displayValue: <ColorCircle color={color} />,
        };
    };

    const colorOptions = (): OptionType[] => {
        return colors.map((color): OptionType => {
            return {
                value: color,
                ariaLabel: colorMapping[color.color],
                displayValue: <ColorCircle color={color} />,
            };
        });
    };

    return (<SelectWithHTMLOptions
        ariaLabel="Color"
        selectedOption={selectedColorOption(selectedColorId)}
        options={colorOptions()}
        onChange={handleColorChange}
    />);
};

export default ColorDropdown;
