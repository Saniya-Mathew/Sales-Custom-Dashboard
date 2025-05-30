from odoo import models, api


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def get_sales_by_team(self):
        team_sales = {}
        salesperson_sales = {}
        product_sales = {}

        # Fetch all confirmed or done sale orders
        confirmed_orders = self.search([('state', 'in', ['sale', 'done'])])

        # Sales by Team
        teams = self.env['crm.team'].search([])
        for team in teams:
            team_orders = confirmed_orders.filtered(lambda o: o.team_id.id == team.id)
            team_sales[team.name] = sum(team_orders.mapped('amount_total'))

        # Sales by Salesperson
        users = self.env['res.users'].search([])
        for user in users:
            user_orders = confirmed_orders.filtered(lambda o: o.user_id.id == user.id)
            total = sum(user_orders.mapped('amount_total'))
            if total > 0:
                salesperson_sales[user.name] = total

        # Product Sales
        order_lines = self.env['sale.order.line'].search([
            ('order_id', 'in', confirmed_orders.ids)
        ])
        for line in order_lines:
            product_name = line.product_id.name
            product_sales[product_name] = product_sales.get(product_name, 0) + line.product_uom_qty

        return {
            "teams": list(team_sales.keys()),
            "sales": list(team_sales.values()),
            "salespersons": list(salesperson_sales.keys()),
            "salesperson_sales": list(salesperson_sales.values()),
            "product_sales": product_sales  # <- All sold products with total quantity
        }
