from odoo import models, fields, api
from odoo.exceptions import UserError

class ResConfigSettings(models.TransientModel):
    
    _inherit = 'res.config.settings'
    
    pos_static_discount_product_id = fields.Many2one('product.product', string='Discount Product', related='pos_config_id.pos_static_discount_product_id', readonly=False)

    @api.constrains('pos_static_discount_product_id')
    def _check_pos_static_discount_product_id(self):
        for record in self:
            if record.pos_static_discount_product_id == record.pos_discount_product_id:
                raise UserError(_("Static Discount Product and Discount Product cannot be the same."))