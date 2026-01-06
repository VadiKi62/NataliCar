import { redirect } from "next/navigation";

/**
 * /admin/orders-table - redirect to canonical route /admin/orders
 * 
 * @deprecated Use /admin/orders instead
 */
export default function PageOrdersTable() {
  redirect("/admin/orders");
}
