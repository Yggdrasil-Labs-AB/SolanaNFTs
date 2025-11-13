import { useState, useMemo } from 'react';

import { useWallet } from '@solana/wallet-adapter-react';

import Switch from 'react-switch';

import '../../css/mobile-Filter.css'

import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';

import {
    generalTypes,
    affinityOptions,
    armorOptions,
    weaponOptions,
    accessoriesOptions,
    rarityOptions
} from '../../config/gameConfig';

import PopUpFilter from './PopUpFilter';
import FilterBubbles from './FilterBubbles';
import SearchBar from './SearchBar';


const Filter = ({
    title,
    selectedType,
    setSelectedType,
    selectedSubType,
    setSelectedSubType,
    selectedRarity,
    setSelectedRarity,
    selectedCreator,
    setSelectedCreator,
    filterByCreator = false }) => {

    const wallet = useWallet();

    const { refetchNftConcepts } = useGlobalVariables();

    const [checked, setChecked] = useState(false);
    // const [selectedFiltersCount, setSelectedFiltersCount] = useState(0);

    const address = wallet.publicKey ? wallet.publicKey.toString() : 'all';

    // Update filter count when any filter changes
    const selectedFiltersCount = useMemo(() => {
        return [selectedType, selectedSubType, selectedRarity, selectedCreator]
            .filter(value => value !== 'all').length;
    }, [selectedType, selectedSubType, selectedRarity, selectedCreator]);

    const resetFilters = () => {
        setSelectedType('all');
        setSelectedSubType('all');
        setSelectedRarity('all');
        setSelectedCreator('all');
        setChecked(false);
    }

    const handleChange = () => {

        if (selectedCreator === 'all') {
            setSelectedCreator(address);
            setChecked(!checked);
        } else {
            setSelectedCreator('all');
            setChecked(!checked);
        }
    }

    const filteredGeneralTypes = [...generalTypes, 'all'];; //Add all for search filters
    const filteredWeaponOptions = [...weaponOptions, 'all'];
    const filteredArmorOptions = [...armorOptions, 'all'];
    const filteredAccessoryOptions = [...accessoriesOptions, 'all'];
    const filteredRarityOptions = [...rarityOptions, 'all'];

    const determineSubType = () => {

        if (selectedType === 'all') {
            setSelectedSubType('all');
        }

        switch (selectedType) {
            case 'weapon':
                return filteredWeaponOptions;
            case 'armor':
                return filteredArmorOptions;
            case 'accessory':
                return filteredAccessoryOptions;
            case 'all':
                return ['all'];
        }
    }

    return (
        <div className="d-flex flex-column" style={{ color: 'white', padding: '0px 25px' }}>
            <h1 className="align-self-start filter-title">{title} <span className='disable-on-mobile' style={{ fontSize: '16px' }}>[solana]</span></h1>
            <div className="d-flex justify-content-between align-items-end">

                {/* Desktop Button Group */}
                <div className="disable-on-mobile d-flex gap-3">
                    {filteredGeneralTypes.map((item) => (
                        <button
                            key={item}
                            href="#"
                            className={selectedType === item ? "selected-button" : "strip-button"}
                            onClick={() => { setSelectedType(item), setSelectedSubType('all') }}
                        >
                            {item.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* MOBILE POP UP FILTER SYSTEM */}
                <div className='enable-on-mobile'>
                    <PopUpFilter buttonLabel='Filters' selectedFiltersCount={selectedFiltersCount} resetFilters={resetFilters}>
                        <div className="d-flex align-items-center gap-2">
                            <Switch
                                onChange={handleChange}
                                checked={checked}
                                offColor="#888"
                                onColor="#6a0dad"
                                offHandleColor="#444"
                                onHandleColor="#fff"
                                uncheckedIcon={false}
                                checkedIcon={false}
                            />
                            <p className="m-0 marykate" style={{ fontSize: '1.3rem' }}>By Me</p>
                        </div>
                        <FilterBubbles
                            label={'Type'}
                            selectedValue={selectedType}
                            options={filteredGeneralTypes}
                            onSelect={setSelectedType} />
                        <FilterBubbles
                            label={'SubType'}
                            selectedValue={selectedSubType}
                            options={determineSubType()}
                            onSelect={setSelectedSubType}
                        />
                        <FilterBubbles
                            label={'Rarity'}
                            selectedValue={selectedRarity}
                            options={filteredRarityOptions}
                            onSelect={setSelectedRarity} />
                    </PopUpFilter>
                </div>

                <div className="d-flex align-items-center gap-2 disable-on-mobile">
                    <Switch
                        onChange={handleChange}
                        checked={checked}
                        offColor="#888"
                        onColor="#6a0dad"
                        offHandleColor="#444"
                        onHandleColor="#fff"
                        uncheckedIcon={false}
                        checkedIcon={false}
                    />
                    <p className="m-0 marykate" style={{ fontSize: '1.3rem' }}>By Me</p>
                </div>
                <div className='d-flex gap-2'>
                    {/* Searchbox */}
                    <SearchBar />
                </div>
            </div>
            <div style={{ width: '100%', borderTop: '1px solid white', margin: '5px 0px 10px 0px' }}></div>
            <div className='disable-on-mobile'>
                {selectedType === "weapon" && (
                    <div>
                        <div className="d-flex gap-2" style={{ marginBottom: '10px' }}>
                            +
                            {filteredWeaponOptions.map((item) => (
                                <button
                                    key={item}
                                    className={selectedSubType === item ? "circle-button-selected" : "circle-button"}
                                    onClick={() => { setSelectedSubType(item) }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {selectedType === "armor" && (
                    <div>
                        <div className="d-flex gap-2" style={{ marginBottom: '10px' }}>
                            +
                            {filteredArmorOptions.map((item) => (
                                <button
                                    key={item}
                                    className={selectedSubType === item ? "circle-button-selected" : "circle-button"}
                                    onClick={() => setSelectedSubType(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop Filter */}
                <div className="d-flex gap-2 disable-on-mobile">
                    +
                    {filteredRarityOptions.map((item) => (
                        <button
                            key={item}
                            className={selectedRarity === item ? "circle-button-selected" : "circle-button"}
                            onClick={() => setSelectedRarity(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Mobile Filter */}
                {/* <div className="dropdown">
                    <div className="d-flex gap-2">
                        <div className="marykate" style={{ fontSize: '1.25rem' }}>Rarity</div>
                        <button
                            className="dropdown-toggle"
                            onClick={handleDropdownToggleOfRarity}
                        >
                            {selectedType ? selectedType.toUpperCase() : "SELECT"}
                        </button>
                    </div>
                    {isDropdownOpenRarity && (
                        <ul className="dropdown-menu">
                            {filteredRarityOptions.map((item) => (
                                <li key={item} className="dropdown-item">
                                    <button
                                        className="dropdown-item-button"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div> */}



            </div>
        </div>
    )
}

export default Filter;