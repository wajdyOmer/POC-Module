import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { patch } from "@web/core/utils/patch";
import { onMounted } from "@odoo/owl";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { useService } from "@web/core/utils/hooks";
import {
    makeAwaitable,
    ask,
    makeActionAwaitable,
} from "@point_of_sale/app/utils/make_awaitable_dialog";
import { EmployeeList } from "./employee_list";
import { OrderDiscountPopup } from "./order_discount_popup";

patch(ProductScreen.prototype, {
    showCommissionView() {
        this.pos.selectEmployee();
    }
});

patch(PosStore.prototype, {

    setup() {
        super.setup(...arguments);
        this.screenState = {
            ...this.screenState,
            employeeList: {
                offsetBySearch: {},
                value: [],
            },
        };
    },

    async selectEmployee(currentOrder = this.getOrder()) {
        // FIXME, find order to refund when we are in the ticketscreen.
        if (!currentOrder) {
            return false;
        }
        const currentEmployee = currentOrder.getEmployee();
        const payload = await makeAwaitable(this.dialog, EmployeeList, {
            employee: currentEmployee,
        });

        return payload;
    },

    async showDiscountPopup() {

        const currentOrder = this.getOrder();
        if (!currentOrder || currentOrder.isEmpty()) {
            return;
        }

        const orderTotal = currentOrder.priceExcl;
        const currentDiscount = currentOrder.getDiscount();

        const { confirmed, payload } = await makeAwaitable(this.dialog, OrderDiscountPopup, {
            orderTotal: orderTotal,
            discountType: currentDiscount.type || '',
            discountValue: currentDiscount.value || 0,
        });

        if (confirmed && payload) {
            await this.setDiscount(payload.value, payload.type);
        }
    },
    loadEmployeesInfo() {
        this.data.orm.searchRead("hr.employee", [], ["id", "name"])
            .then((employees) => {
                this.screenState.employeeList.offsetBySearch = {
                    "": employees.length,
                };
                this.screenState.employeeList.value = employees;
            });
    },

    computePercentageDiscount(discount) {
        return (discount / 100) * this.getTotalWithoutDiscount();
    },

    async setDiscount(discount, discountType) {

        const currentOrder = this.getOrder();
        const staticDiscountProduct = this.config.pos_static_discount_product_id;
        const discountProduct = this.config.discount_product_id;

        let line = currentOrder.lines.find((line) => line.product_id.id === discountProduct.id || line.product_id.id === staticDiscountProduct.id);
        line?.delete();

        if (discountType == 'percentage') {
            return this.applyDiscount(discount)
        }

        line = await this.addLineToCurrentOrder(
            {
                product_id: staticDiscountProduct,
                price_unit: discount > 0 ? discount * -1 : discount,
                product_tmpl_id: staticDiscountProduct.product_tmpl_id,
            },
            {}
        );

        currentOrder.discount_line = line;
        currentOrder.is_discounted = true;
        currentOrder.discount_amount = discount;
        return line;
    },

    async processServerData() {
        await super.processServerData();
        await this.loadEmployeesInfo();
    }
});