# POS Receipt Customization Module for Odoo 18

This module allows you to customize Point of Sale receipts with custom logos and text in Odoo 18.

## Features

- ✅ **Custom Receipt Logo**: Upload a custom logo specifically for receipts
- ✅ **Flexible Logo Options**: Choose between custom logo or company logo
- ✅ **Custom Header Text**: Add personalized text at the top of receipts
- ✅ **Custom Footer Text**: Add thank you messages or other footer text
- ✅ **Easy Configuration**: All settings accessible from POS Configuration
- ✅ **Per-POS Configuration**: Different settings for each Point of Sale

## Installation

### 1. Copy Module to Addons Directory

Copy the `pos_receipt_custom` folder to your Odoo addons directory:

```bash
cp -r pos_receipt_custom /path/to/odoo/addons/
```

Or create a symlink:

```bash
ln -s /path/to/pos_receipt_custom /path/to/odoo/addons/
```

### 2. Update Apps List

1. Go to **Apps** menu in Odoo
2. Click on the **Update Apps List** (you may need to activate Developer Mode)
3. Click **Update**

### 3. Install the Module

1. Search for "POS Receipt Customization" in the Apps menu
2. Click **Install**

## Configuration

### Setting Up Custom Receipt Logo

1. Go to **Point of Sale → Configuration → Point of Sale**
2. Select your POS configuration
3. Navigate to the **Bills & Receipts** tab
4. In the **Receipt Customization** section:
   - Enable **Use Custom Receipt Logo**
   - Upload your custom logo image (recommended size: 400x150px)
   - Add optional **Receipt Header Text** (e.g., "Welcome to our store!")
   - Add optional **Receipt Footer Text** (e.g., "Thank you for your business!")
5. Click **Save**

### Logo Behavior

- **If custom logo is enabled and uploaded**: Your custom logo will appear on receipts
- **If custom logo is disabled**: The company logo will be used (default Odoo behavior)
- **If no logo is available**: Receipt will display without a logo

## Usage

Once configured, the custom logo and text will automatically appear on:

- Printed receipts
- Email receipts
- Receipt previews in the POS interface

### Testing Your Configuration

1. Open your POS session
2. Create a test order
3. Click **Payment** and complete the transaction
4. View or print the receipt
5. Verify that your custom logo and text appear correctly

## Technical Details

### Module Structure

```
pos_receipt_custom/
├── __init__.py                      # Module initialization
├── __manifest__.py                  # Module manifest
├── models/
│   ├── __init__.py
│   └── pos_config.py               # Extended POS configuration model
├── views/
│   └── pos_config_views.xml        # POS configuration form view
├── security/
│   └── ir.model.access.csv         # Access rights
├── static/
│   ├── description/
│   │   └── icon.png                # Module icon
│   └── src/
│       ├── img/
│       │   └── receipt_logo.png    # Sample receipt logo
│       └── xml/
│           └── pos_receipt.xml     # Receipt template override
└── README.md                        # This file
```

### Key Components

#### Models (`models/pos_config.py`)

Extends `pos.config` with the following fields:
- `receipt_logo`: Binary field for custom logo image
- `use_custom_receipt_logo`: Boolean to enable/disable custom logo
- `receipt_header_text`: Text field for header message
- `receipt_footer_text`: Text field for footer message

#### Template Override (`static/src/xml/pos_receipt.xml`)

Overrides the `point_of_sale.OrderReceipt` template to:
- Display custom logo when enabled
- Fall back to company logo when custom logo is disabled
- Add custom header and footer text sections

### Compatibility

- **Odoo Version**: 18.0
- **Dependencies**: `point_of_sale`
- **License**: LGPL-3

## Troubleshooting

### Logo Not Appearing

1. Verify that "Use Custom Receipt Logo" is enabled
2. Check that an image has been uploaded
3. Clear browser cache and reload the POS
4. Restart the Odoo service: `sudo systemctl restart odoo`

### Module Not Appearing in Apps

1. Ensure the module is in the correct addons directory
2. Update the apps list (Apps → Update Apps List)
3. Check Odoo logs for any errors
4. Verify file permissions: `chmod -R 755 pos_receipt_custom`

### Receipt Template Not Updating

1. Clear browser cache
2. Restart Odoo service
3. Update the module: Apps → POS Receipt Customization → Upgrade

## Customization

### Changing Receipt Styling

Edit `static/src/xml/pos_receipt.xml` to modify:
- Logo size and positioning
- Header/footer text styling
- Colors and fonts
- Layout and spacing

Example - Change logo size:

```xml
<img t-att-src="'data:image/png;base64,' + props.data.pos.config.receipt_logo" 
     alt="Receipt Logo"
     style="max-width: 300px; max-height: 150px; display: block; margin: 0 auto;"/>
```

### Adding More Fields

1. Add fields to `models/pos_config.py`
2. Add fields to loader in `_loader_params_pos_config()`
3. Update `views/pos_config_views.xml` to show fields in UI
4. Update `static/src/xml/pos_receipt.xml` to display data

## Support

For issues, questions, or contributions:
- Check Odoo logs: `/var/log/odoo/odoo-server.log`
- Enable Developer Mode for detailed error messages
- Review the Odoo documentation: https://www.odoo.com/documentation/18.0/

## License

This module is licensed under LGPL-3.

## Author

Your Company - https://www.yourcompany.com

---

**Version**: 18.0.1.0.0  
**Last Updated**: 2026-01-19
