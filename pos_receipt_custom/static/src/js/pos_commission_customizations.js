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

        // this.setPartnerToCurrentOrder(payload || false);
        return payload;
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
    async processServerData() {
        await super.processServerData();
        await this.loadEmployeesInfo();
    }
});