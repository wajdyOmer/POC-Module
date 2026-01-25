from odoo import fields, models, api
from odoo.exceptions import UserError
import xlsxwriter
import base64
from io import BytesIO
from datetime import datetime

class HrEmployee(models.Model):
    _inherit = "hr.employee"

    employee_order_lines = fields.One2many('pos_order_line_employee_rel', 'employee_id', string='POS Orders')

    @api.model
    def _load_pos_data_domain(self, data, config):
        return []

    @api.model
    def _load_pos_data_fields(self, config):
        return [field.name for field in self._fields.values()]

    def export_employees_orders_excel(self):
        """Export employee orders to Excel with a sheet per employee"""
        # Get selected employees or all if none selected
        employees = self if self else self.search([])
        
        if not employees:
            raise UserError("No employees found to export.")
        
        # Create Excel file in memory
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        
        # Define formats
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#71639e',
            'font_color': 'white',
            'border': 1,
            'align': 'center',
            'valign': 'vcenter'
        })
        
        cell_format = workbook.add_format({
            'border': 1,
            'align': 'left',
            'valign': 'vcenter'
        })
        
        number_format = workbook.add_format({
            'border': 1,
            'align': 'right',
            'num_format': '#,##0.00'
        })
        
        date_format = workbook.add_format({
            'border': 1,
            'align': 'center',
            'num_format': 'yyyy-mm-dd hh:mm:ss'
        })
        
        # Create a sheet for each employee
        for employee in employees:
            # Sanitize sheet name (Excel has restrictions)
            sheet_name = employee.name[:31] if employee.name else f'Employee_{employee.id}'
            sheet_name = sheet_name.replace('/', '-').replace('\\', '-').replace('*', '').replace('[', '').replace(']', '').replace(':', '').replace('?', '')
            
            worksheet = workbook.add_worksheet(sheet_name)
            
            # Set column widths
            worksheet.set_column('A:A', 20)  # Order Line
            worksheet.set_column('B:B', 25)  # Product
            worksheet.set_column('C:C', 12)  # Quantity
            worksheet.set_column('D:D', 15)  # Price Subtotal
            worksheet.set_column('E:E', 18)  # Price Subtotal Incl
            worksheet.set_column('F:F', 18)  # Commission Amount
            worksheet.set_column('G:G', 15)  # Order Status
            worksheet.set_column('H:H', 20)  # Order Date
            
            # Write employee info
            worksheet.write(0, 0, 'Employee:', header_format)
            worksheet.write(0, 1, employee.name or '', cell_format)
            worksheet.write(1, 0, 'Total Orders:', header_format)
            worksheet.write(1, 1, len(employee.employee_order_lines), cell_format)
            
            # Write headers
            row = 3
            headers = [
                'Order Line',
                'Product',
                'Quantity',
                'Price Subtotal',
                'Price Subtotal Incl',
                'Commission Amount',
                'Order Status',
                'Order Date'
            ]
            
            for col, header in enumerate(headers):
                worksheet.write(row, col, header, header_format)
            
            # Write data
            row = 4
            total_commission = 0
            
            for order_line in employee.employee_order_lines:
                order_line_obj = order_line.order_line_id
                
                worksheet.write(row, 0, order_line_obj.full_product_name or '', cell_format)
                worksheet.write(row, 1, order_line_obj.product_id.name or '', cell_format)
                worksheet.write(row, 2, order_line_obj.qty or 0, number_format)
                worksheet.write(row, 3, order_line.price_subtotal or 0, number_format)
                worksheet.write(row, 4, order_line.price_subtotal_incl or 0, number_format)
                worksheet.write(row, 5, order_line.commission_amount or 0, number_format)
                worksheet.write(row, 6, dict(order_line_obj.order_id._fields['state'].selection).get(order_line.order_status, ''), cell_format)
                
                # Order date
                if order_line_obj.order_id.date_order:
                    worksheet.write_datetime(row, 7, order_line_obj.order_id.date_order, date_format)
                else:
                    worksheet.write(row, 7, '', cell_format)
                
                total_commission += order_line.commission_amount or 0
                row += 1
            
            # Write totals
            if employee.employee_order_lines:
                row += 1
                worksheet.write(row, 4, 'Total Commission:', header_format)
                worksheet.write(row, 5, total_commission, number_format)
        
        # Close workbook and get file data
        workbook.close()
        output.seek(0)
        file_data = output.read()
        output.close()
        
        # Create attachment
        filename = f'employees_orders_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        attachment = self.env['ir.attachment'].create({
            'name': filename,
            'type': 'binary',
            'datas': base64.b64encode(file_data),
            'store_fname': filename,
            'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        
        # Return download action
        return {
            'type': 'ir.actions.act_url',
            'url': f'/web/content/{attachment.id}?download=true',
            'target': 'self',
        }