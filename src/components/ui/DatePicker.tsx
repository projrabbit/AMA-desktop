import type { InputHTMLAttributes } from 'react';

import { Input } from './Input';

export function DatePicker(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string }) {
  return <Input type="date" {...props} />;
}
