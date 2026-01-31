import { Orderline } from "@point_of_sale/app/components/orderline/orderline";
import { patch } from "@web/core/utils/patch";
import { MultiSelectionField } from "./multi_selection";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";
import { useState } from "@odoo/owl";

patch(Orderline.prototype, {
    setup() {
        super.setup(...arguments);
        this.pos = usePos();
    },

    onEmployeeChange(value, line) {
        // Update the employee IDs for this order line
        line.setEmployeeIds(value || []);
    }
});

patch(Orderline, {
    components: {
        ...Orderline.components,
        MultiSelectionField
    }
});