from odoo import models,fields,api

class PosOrderLineEmployee(models.Model):

    _name = 'pos_order_line_employee_rel'
    _description = 'Pos Order Line Employee'
    _rec_name = 'employee_id'

    order_line_id = fields.Many2one('pos.order.line', string='Order Line')
    price_subtotal = fields.Float(string = 'Price Subtotal')
    price_subtotal_incl = fields.Float(string = 'Price Subtotal Incl')
    commission_amount = fields.Float(string = 'Commission Amount')
    employee_id = fields.Many2one('hr.employee', string='Employee')
    order_status = fields.Selection(related = 'order_line_id.order_id.state')

class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    employee_ids = fields.Many2many('hr.employee', string='Employees' , relation='pos_order_line_employee_rel', column1='order_line_id', column2='employee_id')
    employee_order_lines = fields.One2many('pos_order_line_employee_rel', 'order_line_id', string='POS Orders')

    @api.model
    def _load_pos_data_fields(self, config):
        config = super(PosOrderLine, self)._load_pos_data_fields(config)
        return config + ['employee_ids']

    def _export_for_ui(self, orderline):
        """Export employee_ids as a list of IDs for the POS UI"""
        result = super()._export_for_ui(orderline)
        result['employee_ids'] = [(6, 0, orderline.employee_ids.ids)]
        return result

    def update_employee_ids(self , val):
        employee_lines = []
        if val.get('employee_ids'):
            for employee in val['employee_ids']:
                if val['qty'] < 1:
                    continue
                employee_lines.append([0,0,{
                    'price_subtotal': val['price_subtotal'],
                    'price_subtotal_incl': val['price_subtotal_incl'],
                    'commission_amount': val['price_subtotal_incl'] / len(val['employee_ids']),
                    'employee_id': employee
            }])
            del val['employee_ids']
            val['employee_order_lines'] = employee_lines


    # def update_employee_ids(self,vals, res):
    #     vals_by_uuid = {val['uuid'] : val.get('employee_ids') for val in vals} if isinstance(vals , list) else {vals.get('uuid') or res.uuid : vals.get('employee_ids')}
    #     for rec in res:
    #         if vals_by_uuid.get(rec.uuid):
    #             for employee in rec.employee_order_lines:
    #                 employee.price_subtotal = rec.price_subtotal
    #                 employee.price_subtotal_incl = rec.price_subtotal_incl
    #                 employee.commission_amount = (rec.price_subtotal_incl / len(employee.employee_ids))

    @api.model_create_multi
    def create(self , vals):
        for val in vals:
            self.update_employee_ids(val)
        res = super(PosOrderLine, self).create(vals)
        return res

    def write(self, vals):
        self.update_employee_ids(vals)
        res = super(PosOrderLine, self).write(vals)
        return res