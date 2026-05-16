import { headers } from 'next/headers';
import { App } from '@/components/app/app';
import { getAppConfig } from '@/lib/utils';

export default async function Page({ params }: { params: Promise<{ room_name: string }> }) {
  const { room_name } = await params;
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);

  return <App appConfig={appConfig} roomName={room_name} />;
}
