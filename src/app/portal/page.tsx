import { redirect } from "next/navigation";

/** Footer and nav link to `/portal`; send visitors to sign-in. */
export default function PortalIndexPage() {
  redirect("/portal/login");
}
