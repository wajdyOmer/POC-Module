import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";

export class EmployeeLine extends Component {
    static template = "point_of_sale.EmployeeLine";
    static components = { Dropdown, DropdownItem };
    static props = [
        "close",
        "employee",
        "isSelected",
        "isBalanceDisplayed",
        "onClickEdit",
        "onClickUnselect",
        "onClickEmployee",
        "onClickOrders",
    ];

    setup() {
        this.pos = usePos();
        this.ui = useService("ui");
    }
}