// src/app/login/page.tsx

import { Suspense } from 'react';
import LoginClientPage from './LoginClientPage';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClientPage />
    </Suspense>
  );
}
