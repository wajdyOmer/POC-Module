from odoo import models, fields, api ,_
from odoo.exceptions import UserError

class PosConfigInherit(models.Model):

    _inherit = 'pos.config'

    pos_static_discount_product_id = fields.Many2one('product.product', string='Static Discount Product')


    @api.constrains('pos_static_discount_product_id')
    def _check_pos_static_discount_product_id(self):
        for record in self:
            if record.pos_static_discount_product_id == record.discount_product_id:
                raise UserError(_("Static Discount Product and Discount Product cannot be the same."))