import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface InputWithLabelProps extends React.ComponentProps<'input'> {
  id: string;
  label: string;
}
export function InputWithLabel(props: InputWithLabelProps): React.JSX.Element {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input {...props} id={props.id} />
    </div>
  );
}
