import { ProfileRegistryPageView } from "@/components/account/profile-registry-page"

export default function ExecutiveProfilePage() {
  return (
    <ProfileRegistryPageView
      title="Executive Registry Profile"
      description="Your approved executive identity record and digital membership card."
      profileUpdateHref="/executive/profile/edit"
    />
  )
}
