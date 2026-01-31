from odoo import models,fields,api

class PosOrderLineEmployee(models.Model):

    _name = 'pos_order_line_employee_rel'
    _description = 'Pos Order Line Employee'
    _rec_name = 'employee_id'

    order_line_id = fields.Many2one('pos.order.line', string='Order Line')
    currency_id = fields.Many2one('res.currency', string='Currency',related = 'order_line_id.currency_id' ,store = True)
    price_subtotal = fields.Monetary(string = 'Price Subtotal',related = 'order_line_id.price_subtotal' ,store = True)
    price_subtotal_incl = fields.Monetary(string = 'Price Subtotal Incl',related = 'order_line_id.price_subtotal_incl' ,store = True)
    commission_amount = fields.Monetary(string = 'Commission Amount',store = True)
    employee_id = fields.Many2one('hr.employee', string='Employee')
    order_status = fields.Selection(related = 'order_line_id.order_id.state')

    def unlink(self):
        ids = self.mapped('order_line_id.id')
        res = super(PosOrderLineEmployee, self).unlink()
        self.env['pos.order.line'].browse(ids).update_employee_ids()
        return res

    def write(self, vals):
        res = super(PosOrderLineEmployee, self).write(vals)
        if not self._context.get('prices_computed',False):
            for rec in self:
                if rec.order_line_id:
                    rec.order_line_id.update_employee_ids()
        return res

    @api.model_create_multi
    def create(self, vals):
        res = super(PosOrderLineEmployee, self).create(vals)
        if not self._context.get('prices_computed',False):
            for rec in res:
                if rec.order_line_id:
                    rec.order_line_id.update_employee_ids()
        return res

class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    employee_ids = fields.Many2many('hr.employee', string='Employees' , relation='pos_order_line_employee_rel', column1='order_line_id', column2='employee_id')
    employee_order_lines = fields.One2many('pos_order_line_employee_rel', 'order_line_id', string='POS Orders')
    is_discount = fields.Boolean(string = 'Is Discount Line')

    @api.model
    def _load_pos_data_fields(self, config):
        config = super(PosOrderLine, self)._load_pos_data_fields(config)
        return config + ['employee_ids' , 'is_discount']

    def _export_for_ui(self, orderline):
        """Export employee_ids as a list of IDs for the POS UI"""
        result = super()._export_for_ui(orderline)
        result['employee_ids'] = [(6, 0, orderline.employee_ids.ids)]
        result['is_discount'] = orderline.is_discount
        return result

    def update_employee_ids(self):
        for rec in self:
            if rec.employee_ids.ids:
                line_ids = self.env['pos_order_line_employee_rel'].search([('order_line_id', '=', rec.id),('employee_id', 'in', rec.employee_ids.ids)])
                if line_ids:
                    line_ids.with_context({'prices_computed': True}).write({
                        'price_subtotal': rec.price_subtotal,
                        'currency_id': rec.currency_id,
                        'price_subtotal_incl': rec.price_subtotal_incl,
                        'commission_amount': (rec.price_subtotal_incl / (len(rec.employee_ids) or 1))
                    })

    @api.model_create_multi
    def create(self , vals):
        res = super(PosOrderLine, self).create(vals)
        res.update_employee_ids()
        return res

    def write(self, vals):
        res = super(PosOrderLine, self).write(vals)
        self.update_employee_ids()
        return res