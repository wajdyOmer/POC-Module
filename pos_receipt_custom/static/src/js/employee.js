import { registry } from "@web/core/registry";
// import { Base } from "./related_models";
import { Base } from "@point_of_sale/app/models/related_models";

export class HrEmployee extends Base {
    static pythonModel = "hr.employee";

    get searchString() {
        const fields = ["id", "name", "phone", "email", "vat"];
        return fields
            .map((field) => {
                if (field === "phone" && this[field]) {
                    return this[field].replace(/[+\s()-]/g, "");
                }
                return this[field] || "";
            })
            .filter(Boolean)
            .join(" ");
    }

    exactMatch(searchWord) {
        const fields = ["id", "name", "phone", "email", "vat"];
        return fields.some((field) => this[field] && this[field].toLowerCase() === searchWord);
    }
}
registry.category("pos_available_models").add(HrEmployee.pythonModel, HrEmployee);