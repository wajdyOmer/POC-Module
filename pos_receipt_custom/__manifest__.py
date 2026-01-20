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
    ],
    'data': [
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_receipt_custom/static/src/xml/pos_receipt.xml'
        ]
    },
    'images': ['static/description/icon.png'],
    'installable': True,
    'application': False,
    'auto_install': False,
}
