{
        'name': "Sales Dashboard",
        'version': '1.0',
        'type': 'module',
        'depends': ['base','sale'],
        'author': "San",
        'category': 'Category',
        'description': """Sales Dashboard""",

    'data': [
        'views/sales_dashboard.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'sales_dashboard/static/src/js/sale_dashboard.js',
            'sales_dashboard/static/src/xml/sale_dashboard.xml',
        ],
},

    'license': 'LGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
    'sequence': 2,

}
