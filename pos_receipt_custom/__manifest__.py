# -*- coding: utf-8 -*-
{
    'name': 'POS Receipt Customization',
    'version': '19.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Customize POS receipt with custom logo and layout',
    'description': """
        POS Receipt Customization
        =========================
        This module allows you to:
        * Add custom logo to POS receipts
        * Customize receipt layout and appearance
        * Configure receipt settings per POS
        
        Features:
        ---------
        - Upload custom logo for receipts
        - Override default receipt template
        - Easy configuration through POS settings
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'license': 'LGPL-3',
    'depends': [
        'point_of_sale',
        'hr',
    ],
    'data': [
            'security/ir.model.access.csv',
            'views/hr_employee.xml',
            'views/res_config_settings.xml',
            'views/order_line.xml'
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            # Load model extensions first
            'pos_receipt_custom/static/src/js/pos_model.js',
            
            # Load popup components
            'pos_receipt_custom/static/src/js/order_discount_popup.js',
            'pos_receipt_custom/static/src/xml/order_discount_popup.xml',
            'pos_receipt_custom/static/src/style/order_discount_popup.css',
            
            # Load other components
            'pos_receipt_custom/static/src/xml/pos_receipt.xml',
            'pos_receipt_custom/static/src/js/employee_line.js',
            'pos_receipt_custom/static/src/js/employee_list.js',
            'pos_receipt_custom/static/src/xml/employee_list.xml',
            'pos_receipt_custom/static/src/xml/employee_line.xml',
            'pos_receipt_custom/static/src/js/employee.js',
            'pos_receipt_custom/static/src/xml/orderline_customization.xml',
            'pos_receipt_custom/static/src/js/multi_selection.js',
            'pos_receipt_custom/static/src/xml/multi_selection.xml',
            'pos_receipt_custom/static/src/js/orderline_customization.js',
            'pos_receipt_custom/static/src/style/multi_selection.css',
            'pos_receipt_custom/static/src/js/customer_display_pos_adapter.js',
            
            # Load screen customizations last (depends on popups)
            'pos_receipt_custom/static/src/xml/pos_commission_customizations.xml',
            'pos_receipt_custom/static/src/js/pos_commission_customizations.js',

            'pos_receipt_custom/static/src/js/controll_buttons_patch.js'
        ]
    },
    'images': ['static/description/icon.png'],
    'installable': True,
    'application': False,
    'auto_install': False,
}
