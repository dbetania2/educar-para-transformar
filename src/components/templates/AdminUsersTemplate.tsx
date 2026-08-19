import AdminUsersFeature from "@/features/admin/users/AdminUsersFeature";
import type { AppUserRole } from "@/lib/auth/roles";

type AdminBreadcrumb = {
  label: string;
  href?: string;
};

type AdminUsersTemplateProps = {
  breadcrumbs?: AdminBreadcrumb[];
  pageTitle?: string;
  loadingLabel?: string;
  createModalTitle?: string;
  createModalDescription?: string;
  defaultCreateRole?: AppUserRole;
  defaultRoleFilter?: AppUserRole | null;
  lockedRoleFilter?: AppUserRole | null;
};

export default function AdminUsersTemplate(props: AdminUsersTemplateProps) {
  return <AdminUsersFeature {...props} />;
}
