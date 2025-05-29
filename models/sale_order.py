#-- coding: utf-8 --
from odoo import models

class SaleOrder(models.Model):
    _inherit = "sale.order"

    def get_sales_by_team(self):
        print(55)
        # result = {}
        # teams = self.env['crm.team'].search([])
        # for team in teams:
        #     orders = self.search([('team_id', '=', team.id), ('state', 'in', ['sale', 'done'])])
        #     total_sales = sum(orders.mapped('amount_total'))
        #     result[team.name] = total_sales
        # return {
        #     # "teams": list(result.keys()),
        #     # "sales": list(result.values())
        # }