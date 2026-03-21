import { GenerateWizard } from "./_components/generate-wizard";
import { getProfile } from "../../profile/actions";
import { getAiUsage } from "./actions";

export default async function GenerateRoutinePage() {
  const [profile, usage] = await Promise.all([getProfile(), getAiUsage()]);

  return <GenerateWizard profile={profile} aiUsage={usage} />;
}
