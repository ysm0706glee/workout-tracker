import { GenerateWizard } from "./_components/generate-wizard";
import { getProfile } from "../../profile/actions";

export default async function GenerateRoutinePage() {
  const profile = await getProfile();

  return <GenerateWizard profile={profile} />;
}
