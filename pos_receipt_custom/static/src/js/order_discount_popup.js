import { Component } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Dialog } from "@web/core/dialog/dialog";

export class OrderDiscountPopup extends Component {

    static template = "pos_receipt_custom.OrderDiscountPopup";
    static components = { Dialog };
    static props = {
        close: Function,
        confirmText: { type: String, optional: true },
        cancelText: { type: String, optional: true },
        title: { type: String, optional: true },
        body: { type: String, optional: true },
        orderTotal: { type: Number, optional: true },
        discountType: { type: String, optional: true },
        discountValue: { type: Number, optional: true },
        getPayload: { type: Function }
    };
    static defaultProps = {
        confirmText: _t("Apply"),
        cancelText: _t("Cancel"),
        title: _t("Order Discount"),
        body: "",
    };

    setup() {
        super.setup();
        this.state = useState({
            discountType: this.props.discountType || "percentage",
            discountValue: this.props.discountValue || 0,
            inputValue: this.props.discountValue || "",
        });
        this.ui = useService("ui");
        this.orm = useService("orm");
    }

    get orderTotal() {
        return this.props.orderTotal || 0;
    }

    get calculatedDiscount() {
        const value = parseFloat(this.state.inputValue) || 0;
        if (this.state.discountType === "percentage") {
            return (this.orderTotal * value) / 100;
        }
        return value;
    }

    get discountedTotal() {
        const total = this.orderTotal - this.calculatedDiscount;
        return Math.max(0, total);
    }

    get isValidDiscount() {
        const value = parseFloat(this.state.inputValue) || 0;
        if (value < 0) return false;
        if (this.state.discountType === "percentage" && value > 100) return false;
        if (this.state.discountType === "fixed" && value > this.orderTotal) return false;
        return true;
    }

    onDiscountTypeChange(type) {
        this.state.discountType = type;
        this.state.inputValue = "";
    }

    onInputChange(ev) {
        this.state.inputValue = ev.target.value;
    }

    getPayload() {
        if (!this.isValidDiscount) {
            return null;
        }
        const value = parseFloat(this.state.inputValue) || 0;
        return {
            type: this.state.discountType,
            value: value,
        };
    }
    cancel() {
        this.props.getPayload({ confirmed: false });
        this.props.close();
    }

    async confirm() {
        const payload = this.getPayload();
        if (payload) {
            this.props.getPayload({ confirmed: true, payload });
            this.props.close();
        }
    }
}