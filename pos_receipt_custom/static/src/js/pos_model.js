import { patch } from "@web/core/utils/patch";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { PosOrder } from "@point_of_sale/app/models/pos_order";

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
    get isDiscountLine() {
        return super.isDiscountLine || (
            this.product_id.id === this.config.pos_static_discount_product_id?.id
        );
    }
});

// Patch Order model to add discount functionality
patch(PosOrder.prototype, {
    setup(vals) {
        super.setup(...arguments);
        this.discount_type = vals.discount_type || null;
        this.discount_value = vals.discount_value || 0;
        this.discount_line = null;
    },

    async setDiscount(type, value) {
        this.discount_type = type;
        this.discount_value = value;
    },

    getDiscount() {
        const discount_product = this.config.pos_static_discount_product_id;
        const lines = this.lines;
        if (!discount_product) {
            return 0;
        } else {
            for (const line of lines) {
                if (line.getProduct() === discount_product) {
                    return line.prices.total_excluded_currency;
                }
            }
            return 0;
        }
    },

    // getDiscount() {
    //     return {
    //         type: this.discount_type,
    //         value: this.discount_value,
    //     };
    // },

    getDiscountAmount() {
        if (!this.discount_type || !this.discount_value) {
            return 0;
        }
        const subtotal = this.getTotalWithoutDiscount();
        if (this.discount_type === "percentage") {
            return (subtotal * this.discount_value) / 100;
        }
        return this.discount_value;
    },

    getTotalWithoutDiscount() {
        return super.getTotalWithTax();
    },

    getTotalWithTax() {
        const total = this.getTotalWithoutDiscount();
        const discount = this.getDiscountAmount();
        return Math.max(0, total - discount);
    },

    export_as_JSON() {
        const json = super.export_as_JSON();
        json.discount_type = this.discount_type;
        json.discount_value = this.discount_value;
        return json;
    },

    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.discount_type = json.discount_type || null;
        this.discount_value = json.discount_value || 0;
    },

    export_for_printing() {
        const result = super.export_for_printing(...arguments);
        result.discount_type = this.discount_type;
        result.discount_value = this.discount_value;
        result.discount_amount = this.getDiscountAmount();
        result.total_without_discount = this.getTotalWithoutDiscount();
        return result;
    },
});