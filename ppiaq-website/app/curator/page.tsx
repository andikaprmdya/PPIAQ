import { redirect } from 'next/navigation';

export default function CuratorHomePage() {
  redirect('/curator/events');
}
