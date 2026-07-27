interface Props {
  title: string;
}

export default function Placeholder({ title }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <p>Coming soon.</p>
    </div>
  );
}
