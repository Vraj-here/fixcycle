/**
 * Role metadata only — NO hardcoded credentials, emails, phone numbers, or passwords.
 * Users register and sign in securely through the Login / Registration flow.
 */

export const USER_ROLES = {
  customer: {
    key: 'customer',
    label: 'Customer',
    description: 'Book smartphone repairs, compare quotations, and track doorstep pickup.',
    defaultRoute: '/my-bookings',
  },
  shop_owner: {
    key: 'shop_owner',
    label: 'Shop Owner',
    description: 'Manage incoming repair requests, submit quotations, and update repair progress.',
    defaultRoute: '/shop-dashboard',
  },
  delivery_partner: {
    key: 'delivery_partner',
    label: 'Delivery Partner',
    description: 'Handle doorstep pickup and return delivery milestones across Pune.',
    defaultRoute: '/delivery-dashboard',
  },
};
