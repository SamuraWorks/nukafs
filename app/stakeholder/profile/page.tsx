import { ProfileRegistryPageView } from "@/components/account/profile-registry-page"

export default function StakeholderProfilePage() {
  return (
    <ProfileRegistryPageView
      title="Stakeholder Registry Profile"
      description="Your verified stakeholder identity record and permanent membership card."
      profileUpdateHref="/stakeholder/profile/edit"
    />
  )
}
