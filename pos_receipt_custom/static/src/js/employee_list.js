import { _t } from "@web/core/l10n/translation";
import { useChildRef, useService } from "@web/core/utils/hooks";
import { Dialog } from "@web/core/dialog/dialog";
import { PartnerLine } from "@point_of_sale/app/screens/partner_list/partner_line/partner_line";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";
import { Input } from "@point_of_sale/app/components/inputs/input/input";
import { Component, useEffect, useState, onWillStart } from "@odoo/owl";
import { useHotkey } from "@web/core/hotkeys/hotkey_hook";
import { normalize } from "@web/core/l10n/utils";
import { debounce } from "@web/core/utils/timing";

export class EmployeeList extends Component {
    static components = { PartnerLine, Dialog, Input };
    static template = "point_of_sale.EmployeeList";
    static props = {
        employee: {
            optional: true,
            type: [{ value: null }, Object],
        },
        getPayload: { type: Function },
        close: { type: Function },
    };

    setup() {
        this.pos = usePos();
        this.ui = useService("ui");
        this.notification = useService("notification");
        this.dialog = useService("dialog");
        this.modalRef = useChildRef();
        this.modalContent = null;
        this.orm = useService("orm");
        this.state = useState({
            initialEmployees: this.pos.models["hr.employee"].filter((p) => {
                return true;
            }),
            loadedEmployees: [],
            query: "",
            loading: false,
        });
        this.loadedEmployeeIds = new Set(this.state.initialEmployees.map((p) => p.id));
        useHotkey("enter", () => this.onEnter(), {
            bypassEditableProtection: true,
        });
        this.onScroll = debounce(this.onScroll.bind(this), 200);

        useEffect(
            () => {
                if (this.state.loading || !this.modalRef.el) {
                    return;
                } else if (!this.modalContent) {
                    this.modalContent = this.modalRef.el.querySelector(".modal-body");
                }

                const scrollMethod = this.onScroll.bind(this);
                this.modalContent.addEventListener("scroll", scrollMethod);
                return () => {
                    this.modalContent.removeEventListener("scroll", scrollMethod);
                };
            },
            () => [this.modalRef.el]
        );
        onWillStart(async () => {
            // await this.loadEmployees();
        });
    }
    async loadEmployees() {
        this.state.initialEmployees = await this.orm.searchRead("hr.employee", []);
    }

    get globalState() {
        return this.pos.screenState.employeeList;
    }

    onScroll(ev) {
        if (this.state.loading || !this.modalContent) {
            return;
        }
        const height = this.modalContent.offsetHeight;
        const scrollTop = this.modalContent.scrollTop;
        const scrollHeight = this.modalContent.scrollHeight;

        if (scrollTop + height >= scrollHeight * 0.8) {
            this.getNewPartners();
        }
    }
    async editEmployee(p = false) {
        const employee = await this.pos.editEmployee(p);
        if (employee) {
            this.clickEmployee(employee);
        }
    }
    async onEnter() {
        if (!this.state.query) {
            return;
        }
        const result = await this.getNewEmployee();
        if (result.length > 0) {
            this.notification.add(
                _t('%s customer(s) found for "%s".', result.length, this.state.query),
                3000
            );
        } else {
            this.notification.add(_t('No more customer found for "%s".', this.state.query));
        }
    }

    goToOrders(employee) {
        this.clickEmployee(this.props.employee);
        const employeeHasActiveOrders = this.pos
            .getOpenOrders()
            .some((order) => order.employee?.id === employee.id);
        const stateOverride = {
            search: {
                fieldName: "EMPLOYEE",
                searchTerm: employee.name,
                employeeId: employee.id,
            },
            filter: employeeHasActiveOrders ? "" : "SYNCED",
        };
        this.pos.navigate("TicketScreen", { stateOverride });
    }

    confirm() {
        this.props.resolve({ confirmed: true, payload: this.state.selectedEmployee });
        this.pos.closeTempScreen();
    }
    getEmployees(employees) {
        const searchWord = normalize(this.state.query?.trim() ?? "");
        const exactMatches = employees.filter((employee) => employee.exactMatch(searchWord));

        if (exactMatches.length > 0) {
            return exactMatches;
        }
        const numberString = searchWord.replace(/[+\s()-]/g, "");
        const isSearchWordNumber = /^[0-9]+$/.test(numberString);

        const patternBase = isSearchWordNumber ? numberString : searchWord;
        // Build a RegExp that mimics SQL ILIKE behavior:
        // 1) Escape all RegExp metacharacters so user input is treated literally
        //    (e.g. '.', '+', '[', ']' should not change regex meaning or cause errors)
        // 2) Replace SQL wildcard '%' with RegExp wildcard '.*'
        const regex = new RegExp(
            patternBase
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape regex special characters
                .replace(/%/g, ".*") // convert SQL wildcard to regex wildcard
        );
        const availableEmployees = searchWord
            ? employees.filter((p) => regex.test(normalize(p.searchString)))
            : employees
                .slice(0, 1000)
                .toSorted((a, b) =>
                    this.props.employee?.id === a.id
                        ? -1
                        : this.props.employee?.id === b.id
                            ? 1
                            : (a.name || "").localeCompare(b.name || "")
                );

        return availableEmployees;
    }
    get isBalanceDisplayed() {
        return false;
    }
    clickEmployee(employee) {
        this.props.getPayload(employee);
        this.props.close();
    }
    async searchEmployee() {
        const employee = await this.getNewEmployee();
        return employee;
    }
    async getNewEmployee() {
        let domain = [];
        const offset = this.globalState.offsetBySearch[this.state.query] || 0;
        if (offset > this.loadedEmployeeIds.size) {
            return [];
        }
        if (this.state.query) {
            const search_fields = [
                "name",
                "parent_name",
                "phone_mobile_search",
                "email",
                "barcode",
                "street",
                "zip",
                "city",
                "state_id",
                "country_id",
                "vat",
            ];
            domain = [
                ...Array(search_fields.length - 1).fill("|"),
                ...search_fields.map((field) => [field, "ilike", this.state.query + "%"]),
            ];
        }

        try {
            this.state.loading = true;

            const result = await this.pos.data.callRelated("hr.employee", "get_new_employee", [
                this.pos.config.id,
                domain,
                offset,
            ]);

            this.globalState.offsetBySearch[this.state.query] =
                offset + (result["hr.employee"].length || 100);

            for (const employee of result["hr.employee"]) {
                if (!this.loadedEmployeeIds.has(employee.id)) {
                    this.loadedEmployeeIds.add(employee.id);
                    this.state.loadedEmployees.push(employee);
                }
            }

            return result["hr.employee"];
        } catch {
            return [];
        } finally {
            this.state.loading = false;
        }
    }
}
