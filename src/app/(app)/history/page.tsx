import { HistoryList } from "./_components/history-list";
import { getWorkoutsPage } from "./actions";

export default async function HistoryPage() {
  const { workouts, total } = await getWorkoutsPage(0);

  return <HistoryList workouts={workouts} total={total} />;
}
