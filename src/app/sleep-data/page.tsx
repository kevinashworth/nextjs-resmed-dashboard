import getData from "./get-data";
import PageContent from "./page-content";

export default async function Page() {
  const data = await getData();
  return <PageContent data={data} />;
}
