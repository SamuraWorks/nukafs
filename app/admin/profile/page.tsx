import { ProfileRegistryPageView } from "@/components/account/profile-registry-page"

export default function AdminProfilePage() {
  return (
    <ProfileRegistryPageView
      title="Super Admin Registry Profile"
      description="Your official administrative identity record and permanent digital membership card."
      profileUpdateHref="/admin/profile/edit"
    />
  )
}
