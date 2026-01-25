/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { Component, useState, useRef } from "@odoo/owl";


export class MultiSelectionField extends Component {

    static props = {
        id: { optional: true },
        record: { type: Object, optional: true },
        readonly: { optional: true },
        label: { type: String, optional: true },
        currentValue: { type: Object, optional: true },
        availableTables: { type: Object, optional: true },
        onValueChanged: { type: Function, optional: true },
        context: { type: Object, optional: true },
        section: { type: String, optional: true },
        standalone: { type: String, optional: true },
        isReadonly: { type: Boolean, optional: true }
    };

    static template = "expression_multi_selection_field_template";
    static components = {};

    setup() {

        this.selectionOptions = this.props.availableTables;
        this.currentValue = useState({ 'value': this.props.currentValue ? this.props.currentValue : [] });
        this.showDropDown = useState({ 'value': false })
        this.currentSearchKey = useState({ 'value': '' })
        this.dropDownList = useRef("dropDownList");

        const self = this
        document.addEventListener('click', (ev) => {
            self.showDropDown.value = false
        })
    }

    checkReadonly() {
        return this.props.readonly || this.props.isReadonly
    }

    onElementFocus(ev) {
        ev.stopPropagation();
        if (this.checkReadonly()) return;
        this.showDropDown.value = true;
    }

    onKeyDown(ev) {
        if (ev.keyCode == 13) {
            console.log(this.dropDownList)
        }
    }

    filterBySearchKey(listElements) {
        const searchKey = this.currentSearchKey.value
        return listElements.filter(
            (value) => {
                return !searchKey || (
                    (value.name && (value.name?.toLowerCase().includes(searchKey.toLowerCase()) && value.name?.toLowerCase().startsWith(searchKey))) ||
                    (value.label && (value.label?.toLowerCase().includes(searchKey) || value.label?.toLowerCase().startsWith(searchKey)))
                )
            }
        )
    }

    onKeyWordChanged(ev) {
        const currentSearchKey = ev.target.value;
        this.currentSearchKey.value = currentSearchKey;
    }

    onSelectionValueChanges(ev, value, actionType) {
        if (this.checkReadonly()) return;
        if (actionType == 'remove') {
            this.currentValue.value = this.currentValue.value.filter((el) => el.id != value.id)
        }
        else {
            this.currentValue.value.push(value)
        }
        if (this.props.onValueChanged) {
            this.props.onValueChanged(this.currentValue.value)
        }
    }
}