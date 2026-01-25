import { patch } from "@web/core/utils/patch";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";

patch(PosOrderline.prototype, {
    setup(vals) {
        super.setup(...arguments);
        // Initialize employee_ids as an array
        this.employee_ids = vals.employee_ids || [];
    },

    setEmployeeIds(employeeIds) {
        // Store the employee IDs - extract just the IDs if objects are passed
        const ids = (employeeIds || []).map(emp => emp.id || emp);
        this.employee_ids = ids;
        console.log('Setting employee_ids:', ids);
        // Trigger update to mark the line as modified
        this.update({ employee_ids: ids });
    },

    getEmployeeIds() {
        return this.employee_ids || [];
    },

    exportForPrinting(baseUrl) {
        const result = super.exportForPrinting(...arguments);
        result.employee_ids = this.employee_ids || [];
        return result;
    },

    getDisplayData() {
        const data = super.getDisplayData(...arguments);
        data.employee_ids = this.employee_ids || [];
        return data;
    },
});
